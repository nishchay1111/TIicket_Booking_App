import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JsonStoreService } from '../common/json-store.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TokenBlacklistService } from '../common/token-blacklist.service';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { Role } from '../RBAC/role.enum';
import { OrganizerEntity } from './entities/organizer.entity';
import { plainToInstance } from 'class-transformer';
import { join } from 'path';
import * as fs from 'fs';

import { CreateOrganizerDto } from './dto/create-organizer.dto';
import { CreateEventDto } from './dto/create-event.dto';
import type { Response, Request } from 'express';

@Injectable()
export class OrganizersService {
  constructor(
    private readonly jsonStore: JsonStoreService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly tokenBlacklist: TokenBlacklistService,
  ) {}

  // ─── Generate & Send Tokens ───────────────────────────────────────────
  generateAndSendTokens(res: Response, organizerId: string, role: string) {
    const payload = { user: { id: organizerId, role: role } };

    const authToken = this.jwtService.sign(payload);

    const refreshToken = this.jwtService.sign({ id: organizerId, role: role }, {
      secret:    this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure:   this.configService.get<string>('NODE_ENV') === 'production',
      sameSite: 'strict',
      maxAge:   7 * 24 * 60 * 60 * 1000,
    });

    return authToken;
  }

  // ─── Create Organizer ─────────────────────────────────────────────────
  async createOrganizer(createOrganizerDto: CreateOrganizerDto, res: Response) {
    const organizers     = this.jsonStore.loadData('organizers');
    const { name, email, password } = createOrganizerDto;

    if (organizers.find((o) => o.organizer_email === email)) {
      throw new BadRequestException('An organizer with this email already exists');
    }

    const salt           = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newOrganizer = {
      organizer_id:       uuidv4(),
      organizer_name:     name,
      organizer_email:    email,
      organizer_password: hashedPassword,
      role:               Role.ORGANIZER,
      admin_verification: false,
      date_created:       new Date().toISOString(),
    };

    organizers.push(newOrganizer);
    this.jsonStore.saveData('organizers', organizers);

    const authToken = this.generateAndSendTokens(
      res,
      newOrganizer.organizer_id,
      newOrganizer.role,
    );

    return {
      success:   true,
      authToken,
      organizer: plainToInstance(OrganizerEntity, newOrganizer),
    };
  }

  // ─── Organizer Login ──────────────────────────────────────────────────
  async organizerLogin(loginDto: { email: string; password: string }, res: Response) {
    const { email, password } = loginDto;
    const organizers          = this.jsonStore.loadData('organizers');
    const organizer           = organizers.find((o) => o.organizer_email === email);

    if (!organizer || !(await bcrypt.compare(password, organizer.organizer_password))) {
      throw new BadRequestException('Invalid credentials');
    }

    const authToken = this.generateAndSendTokens(
      res,
      organizer.organizer_id,
      organizer.role || Role.ORGANIZER,
    );

    return {
      success:   true,
      authToken,
      organizer: plainToInstance(OrganizerEntity, organizer),
    };
  }

  // ─── Organizer Logout ─────────────────────────────────────────────────
  async logout(req: Request, res: Response) {
    const authToken    = req.headers['auth-token'] as string;
    const refreshToken = req.cookies?.['refreshToken'];

    if (authToken) {
      await this.tokenBlacklist.revokeToken(authToken, 'access');
    }

    if (refreshToken) {
      await this.tokenBlacklist.revokeToken(refreshToken, 'refresh');
    }

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure:   this.configService.get<string>('NODE_ENV') === 'production',
      sameSite: 'strict',
    });

    return { success: true, message: 'Organizer logged out successfully.' };
  }

  // ─── Fetch Organizer Events ───────────────────────────────────────────
  async fetchOrganizerEvents(organizerId: string) {
    const events          = this.jsonStore.loadData('events');
    const organizerEvents = events.filter((e) => e.organizer_id === organizerId);
    return { success: true, events: organizerEvents };
  }

  // ─── Upload Event Poster ──────────────────────────────────────────────
  async uploadPoster(file: any) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const port     = this.configService.get<string>('PORT') || '5001';
    const imageUrl = `http://localhost:${port}/posters/${file.filename}`;

    return {
      success:   true,
      image_url: imageUrl,
      filename:  file.filename,
      size:      file.size,
    };
  }

  // ─── Delete Poster File from Disk ─────────────────────────────────────
  private deletePosterFile(imageUrl: string) {
    try {
      const filename = imageUrl.split('/posters/').pop();
      if (!filename) return;

      const filePath = join(
        __dirname, '..', '..', 'DataStore', 'Posters', filename, // 👈 fixed — one less '..'
      );

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch {
      // Silently fail if file not found
    }
  }

  // ─── Create Event ─────────────────────────────────────────────────────
  async createEvent(createEventDto: CreateEventDto, organizerId: string) {
    const events = this.jsonStore.loadData('events');

    const newEvent = {
      event_id:          uuidv4(),
      organizer_id:      organizerId,
      event_name:        createEventDto.event_name,
      event_description: createEventDto.event_description  || '',
      event_location:    createEventDto.event_location      || '',
      event_city:        createEventDto.event_city          || '',
      event_category:    createEventDto.event_category      || '',
      event_genre:       createEventDto.event_genre         || '',
      image_url:         createEventDto.image_url           || null,
      show_dates:        createEventDto.show_dates          || [],
      date_created:      new Date().toISOString(),
    };

    events.push(newEvent);
    this.jsonStore.saveData('events', events);

    return {
      success: true,
      message: 'Event created successfully',
      event:   newEvent,
    };
  }

  // ─── Delete Event ─────────────────────────────────────────────────────
  async deleteEvent(eventId: string, organizerId: string) {
    const events     = this.jsonStore.loadData('events');
    const eventIndex = events.findIndex((e) => e.event_id === eventId);

    if (eventIndex === -1) {
      throw new NotFoundException('Event not found');
    }

    if (events[eventIndex].organizer_id !== organizerId) {
      throw new UnauthorizedException('You do not own this event');
    }

    if (events[eventIndex].image_url) {
      this.deletePosterFile(events[eventIndex].image_url);
    }

    events.splice(eventIndex, 1);
    this.jsonStore.saveData('events', events);

    return { success: true, message: 'Event deleted successfully' };
  }

  // ─── Cancel Show ──────────────────────────────────────────────────────
  async cancelShow(eventId: string, showId: string, organizerId: string) {
    const events = this.jsonStore.loadData('events');
    const event  = events.find((e) => e.event_id === eventId);

    if (!event) throw new NotFoundException('Event not found');
    if (event.organizer_id !== organizerId) {
      throw new UnauthorizedException('You do not own this event');
    }

    const showIndex = event.show_dates.findIndex((s: any) => s.show_id === showId);
    if (showIndex === -1) throw new NotFoundException('Show not found');

    event.show_dates[showIndex].cancelled = true;
    this.jsonStore.saveData('events', events);

    return { success: true, message: 'Show cancelled successfully' };
  }

  // ─── Add Show ─────────────────────────────────────────────────────────
  async addShow(eventId: string, showData: any, organizerId: string) {
    const events = this.jsonStore.loadData('events');
    const event  = events.find((e) => e.event_id === eventId);

    if (!event) throw new NotFoundException('Event not found');
    if (event.organizer_id !== organizerId) {
      throw new UnauthorizedException('You do not own this event');
    }

    const newShow = {
      show_id:           uuidv4(),
      show_date:         showData.show_date,
      show_time:         showData.show_time,
      ticket_price:      showData.ticket_price,
      available_tickets: showData.available_tickets,
      cancelled:         false,
    };

    event.show_dates.push(newShow);
    this.jsonStore.saveData('events', events);

    return {
      success: true,
      message: 'Show added successfully',
      show:    newShow,
    };
  }
}