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

/**
 * Service managing core operations for event organizers, handles account registration,
 * secure sessions, event lifecycles, and scheduling configurations.
 */
@Injectable()
export class OrganizersService {
  constructor(
    private readonly jsonStore: JsonStoreService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly tokenBlacklist: TokenBlacklistService,
  ) {}

  /**
   * Generates short-lived access and long-lived refresh tokens, depositing the refresh token into a secure cookie.
   * @param res - The Express response context used to attach cookies.
   * @param organizerId - The unique system identifier for the organizer.
   * @param role - The authorization role tier assigned to the account.
   * @returns A signed short-lived JWT access token string.
   */
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

  /**
   * Registers a new organizer profile inside storage, hashing their payload credentials.
   * @param createOrganizerDto - The validated structural properties required for account setup.
   * @param res - The Express response object used for cookie operations.
   * @returns The generated auth headers alongside the newly serialized organizer entity representation.
   */
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

  /**
   * Validates matching organizer identity structures against storage contexts to initialize an active session.
   * @param loginDto - The input payload consisting of primary lookup credentials.
   * @param res - The Express response context for managing cookie values.
   * @returns The outcome state and authorized access token profiles.
   */
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

  /**
   * Invalidates active authorization string references within the blacklist registry and clears client records.
   * @param req - The incoming Express request instance containing session components.
   * @param res - The outgoing Express response boundary to flush storage states.
   * @returns Explicit confirmation payload indicating success.
   */
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

  /**
   * Filters and retrieves event definitions specifically matching a single organizer context.
   * @param organizerId - The tracking identifier matching the owner context.
   * @returns A collection wrapping all correlated event structures.
   */
  async fetchOrganizerEvents(organizerId: string) {
    const events          = this.jsonStore.loadData('events');
    const organizerEvents = events.filter((e) => e.organizer_id === organizerId);
    return { success: true, events: organizerEvents };
  }

  /**
   * Maps multi-part binary disk details onto uniform public address endpoints.
   * @param file - The Multer file structure metadata object.
   * @returns A payload detailing location paths and target sizing traits.
   */
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

  /**
   * Helper utility executing raw sync unlinks against local host filesystem tracks.
   * @param imageUrl - The structured path URL mapped to the target file.
   * @style internal
   */
  private deletePosterFile(imageUrl: string) {
    try {
      const filename = imageUrl.split('/posters/').pop();
      if (!filename) return;

      const filePath = join(
        __dirname, '..', '..', 'DataStore', 'Posters', filename,
      );

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch {
      // Silently fail if file not found
    }
  }

  /**
   * Compiles, normalizes, and appends a new event profile tree context into data stores.
   * @param createEventDto - The validated properties containing nested scheduling data profiles.
   * @param organizerId - The owner identifier managing creation actions.
   * @returns Success payload enclosing the newly instantiated configuration mapping.
   */
  async createEvent(createEventDto: CreateEventDto, organizerId: string) {
    const events = this.jsonStore.loadData('events');

    const normalizedShows = (createEventDto.shows || []).map((show) => ({
      show_id:           show.show_id || uuidv4(),
      venue_name:        show.venue_name,
      venue_address:     show.venue_address || { street: '', city: '', state: '', zip: '' },
      show_date:         show.show_date,
      show_time:         show.show_time,
      screen:            show.screen ?? null,
      show_language:     show.show_language,
      total_tickets:     Number(show.total_tickets),
      available_tickets: show.available_tickets !== undefined
                            ? Number(show.available_tickets)
                            : Number(show.total_tickets),
      ticket_price:      Number(show.ticket_price),
      active:            show.active !== undefined ? show.active : true,
    }));

    const newEvent = {
      event_id:          uuidv4(),
      organizer_id:      organizerId,
      event_name:        createEventDto.event_name,
      event_description: createEventDto.event_description || '',
      event_category:    createEventDto.event_category     || '',
      event_gener:       createEventDto.event_gener        || '',
      image_url:         createEventDto.image_url          || null,
      shows:             normalizedShows,
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

  /**
   * Completely extracts an event tree block and runs cleaning procedures against target assets.
   * @param eventId - The primary identifier matching the target event configuration block.
   * @param organizerId - The authority validation token ensuring appropriate deletion context.
   * @returns Standard transaction success messaging status objects.
   */
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

  /**
   * Modifies target show schedule element active status mappings inside an event matrix.
   * @param eventId - The parent container reference token key sequence.
   * @param showId - The specific layout runtime tracker sequence.
   * @param organizerId - The checking identity verification sequence context.
   * @returns Execution status results text.
   */
  async cancelShow(eventId: string, showId: string, organizerId: string) {
    const events = this.jsonStore.loadData('events');
    const event  = events.find((e) => e.event_id === eventId);

    if (!event) throw new NotFoundException('Event not found');
    if (event.organizer_id !== organizerId) {
      throw new UnauthorizedException('You do not own this event');
    }

    const showIndex = event.shows.findIndex((s: any) => s.show_id === showId);
    if (showIndex === -1) throw new NotFoundException('Show not found');

    event.shows[showIndex].active = false;
    this.jsonStore.saveData('events', events);

    return { success: true, message: 'Show cancelled successfully' };
  }

  /**
   * Injects a unique schedule structural record configuration into an existing parent event tree profile.
   * @param eventId - The targeted root target event tracker configuration token block.
   * @param showData - The raw parameters payload defining details for the new show window.
   * @param organizerId - The verification validator verifying permissions execution flags.
   * @returns Structured object wrapping update confirmations.
   */
  async addShow(eventId: string, showData: any, organizerId: string) {
    const events = this.jsonStore.loadData('events');
    const event  = events.find((e) => e.event_id === eventId);

    if (!event) throw new NotFoundException('Event not found');
    if (event.organizer_id !== organizerId) {
      throw new UnauthorizedException('You do not own this event');
    }

    const newShow = {
      show_id:           uuidv4(),
      venue_name:        showData.venue_name        || 'Main Venue',
      venue_address:     showData.venue_address      || { street: '', city: '', state: '', zip: '' },
      show_date:         showData.show_date,
      show_time:         showData.show_time,
      screen:            showData.screen             ?? null,
      show_language:     showData.show_language       || '',
      total_tickets:     Number(showData.total_tickets || showData.available_tickets || 0),
      available_tickets: Number(showData.available_tickets || showData.total_tickets || 0),
      ticket_price:      showData.ticket_price,
      active:            true,
    };

    event.shows.push(newShow);
    this.jsonStore.saveData('events', events);

    return {
      success: true,
      message: 'Show added successfully',
      show:    newShow,
    };
  }
}