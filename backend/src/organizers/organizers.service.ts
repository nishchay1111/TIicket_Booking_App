import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JsonStoreService } from '../common/json-store.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config'; 
import { TokenBlacklistService } from '../common/token-blacklist.service'; // 👈 1. Import the blacklist service
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { Role } from '../RBAC/role.enum';
import { OrganizerEntity } from './entities/organizer.entity'; 
import { plainToInstance } from 'class-transformer'; 

import type { Response, Request } from 'express'; // 👈 2. Import Request type here

@Injectable()
export class OrganizersService {

  constructor(
    private readonly jsonStore: JsonStoreService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService, 
    private readonly tokenBlacklist: TokenBlacklistService, // 👈 3. Inject TokenBlacklistService
  ) {}

  generateTokens(res: Response, organizerId: string, role: string) {
    const payload = { 
      user: { 
        id: organizerId,
        role: role 
      } 
    };
    
    const authtoken = this.jwtService.sign(payload);

    const refreshToken = this.jwtService.sign({ id: organizerId, role: role }, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return authtoken;
  }

  async createOrganizer(body: any, res: Response) {
    const organizers = this.jsonStore.loadData('organizers');
    if (organizers.find(o => o.organizer_email === body.email)) {
      throw new BadRequestException('An Organizer with this E-Mail already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(body.password, salt);

    const newOrganizer = {
      organizer_id: uuidv4(),
      organizer_email: body.email,
      organizer_name: body.name,
      organizer_password: hashedPassword,
      role: Role.ORGANIZER,
      admin_verification: 0,
      date_created: new Date().toISOString(),
    };

    organizers.push(newOrganizer);
    this.jsonStore.saveData('organizers', organizers);

    const authtoken = this.generateTokens(res, newOrganizer.organizer_id, newOrganizer.role);
    
    return { 
      success: true, 
      authtoken, 
      organizer: plainToInstance(OrganizerEntity, newOrganizer) 
    };
  }

  async login(body: any, res: Response) {
    const organizers = this.jsonStore.loadData('organizers');
    const org = organizers.find(o => o.organizer_email === body.email);

    if (!org || !(await bcrypt.compare(body.password, org.organizer_password))) {
      throw new BadRequestException('Invalid credentials');
    }

    const authToken = this.generateTokens(res, org.organizer_id, org.role || Role.ORGANIZER);
    
    return { 
      success: true, 
      authToken, 
      organizer: plainToInstance(OrganizerEntity, org) 
    };
  }

  /**
   * Stateful Logout for Organizers
   */
  async logout(req: Request, res: Response) { // 👈 4. Added stateful logout method
    const authToken = req.headers['auth-token'] as string;
    const refreshToken = req.cookies?.['refreshToken'];

    // Blacklist the incoming active auth header token
    if (authToken) {
      await this.tokenBlacklist.revokeToken(authToken);
    }

    // Blacklist the cookie refresh token if it exists
    if (refreshToken) {
      await this.tokenBlacklist.revokeToken(refreshToken);
    }

    // Clear cookie from the organizer's browser
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite: 'strict',
    });

    return { success: true, message: 'Organizer logged out and tokens revoked successfully.' };
  }

  async getMyEvents(organizerId: string) {
    const events = this.jsonStore.loadData('events');
    const orgEvents = events.filter(e => e.organizer_id === organizerId);
    return { success: true, count: orgEvents.length, orgEvents };
  }

  async createEvent(body: any, user: any) {
    if (user.verified === 0) {
      throw new UnauthorizedException('Admin Verification Pending: You cannot create events yet.');
    }

    const cities = this.jsonStore.loadData('city');
    const categories = this.jsonStore.loadData('category');
    
    const categoryExists = categories.some(c => (typeof c === 'string' ? c : c.name) === body.eventCategory);
    const cityExists = cities.some(c => (typeof c === 'string' ? c : c.name) === body.eventCity);

    if (!categoryExists || !cityExists) {
      throw new BadRequestException('Valid City or Category required');
    }

    const events = this.jsonStore.loadData('events');
    const newEvent = {
      event_id: uuidv4(),
      event_name: body.eventName,
      organizer_id: user.id,
      event_city: body.eventCity,
      event_category: body.eventCategory,
      show_dates: body.show_dates.map(show => ({
        show_id: uuidv4(),
        ...show,
        available_tickets: parseInt(show.totalTickets),
        active: true,
      })),
      date_created: new Date().toISOString(),
    };

    events.push(newEvent);
    this.jsonStore.saveData('events', events);
    return { success: true, data: newEvent };
  }
}