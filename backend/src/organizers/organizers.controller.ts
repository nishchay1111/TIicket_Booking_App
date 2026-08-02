import {
  Controller,
  Get,
  Post,
  Delete,
  Put,
  Body,
  Res,
  Req,
  Param,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { OrganizersService } from './organizers.service';
import { UserGuard } from '../user.guard';
import { RolesGuard } from '../RBAC/roles.guard';
import { Roles } from '../RBAC/roles.decorator';
import { Role } from '../RBAC/role.enum';
import { Throttle } from '@nestjs/throttler';
import { Public } from '../RBAC/public.decorator';
import { CreateOrganizerDto } from './dto/create-organizer.dto';
import { CreateEventDto } from './dto/create-event.dto';
import { Request, Response } from 'express';

/**
 * Controller managing administrative operations for event organizers, including
 * profile authentication, asset storage, event lifecycles, and scheduling updates.
 */
@Controller('organizers')
@UseInterceptors(ClassSerializerInterceptor)
export class OrganizersController {
  constructor(private readonly orgService: OrganizersService) {}

  /**
   * Registers a new organizer account on the platform.
   * Rate Limiting: Maximum 3 requests per minute.
   * Access: Public.
   * @param createOrgDto - The validated onboarding payload data.
   * @param res - Express response object utilized for processing session tokens.
   */
  @Public()
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post('createorganizer')
  async signup(
    @Body() createOrgDto: CreateOrganizerDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.orgService.createOrganizer(createOrgDto, res);
  }

  /**
   * Authenticates organizer credentials to establish an administrative session.
   * Access: Public.
   * @param body - The unvalidated payload containing username and password fields.
   * @param res - Express response object for cookie handling.
   */
  @Public()
  @Post('organizerlogin')
  async login(
    @Body() body: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.orgService.organizerLogin(body, res);
  }

  /**
   * Destroys the active organizer session and flushes state cookies.
   * Access: Public.
   * @param req - Express request object representing the sender.
   * @param res - Express response context used to clear authentication headers.
   */
  @Public()
  @Post('logout')
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.orgService.logout(req, res);
  }

  /**
   * Retrieves all event configurations owned or created by the logged-in organizer.
   * Access: Restricted to accounts matching the ORGANIZER role.
   * @param req - The request identity context holding the decoded organizer metadata.
   */
  @UseGuards(UserGuard, RolesGuard)
  @Roles(Role.ORGANIZER)
  @Get('fetchorganizersevents')
  async getEvents(@Req() req: any) {
    return this.orgService.fetchOrganizerEvents(req.user.id);
  }

  /**
   * Processes binary uploads for event poster imagery, applying file filters and limits.
   * Access: Restricted to accounts matching the ORGANIZER role.
   * Constraints: Maximum 5MB file size limit. Restricts validation to standard image MIME types.
   * @param file - The parsed Multer file structure metadata map.
   */
  @UseGuards(UserGuard, RolesGuard)
  @Roles(Role.ORGANIZER)
  @Post('uploadposter')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './DataStore/Posters',
        filename: (req, file, cb) => {
          const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return cb(new Error('Only image files are allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadPoster(@UploadedFile() file: any) {
    return this.orgService.uploadPoster(file);
  }

  /**
   * Compiles and instantiates a new root parent event profile record.
   * Rate Limiting: Maximum 2 requests per 10 minutes.
   * Access: Restricted to accounts matching the ORGANIZER role.
   * @param createEventDto - The validated nested scheduling asset properties payload.
   * @param req - The execution context holding identity keys.
   */
  @UseGuards(UserGuard, RolesGuard)
  @Roles(Role.ORGANIZER)
  @Throttle({ default: { limit: 2, ttl: 600000 } })
  @Post('createEvent')
  async createEvent(
    @Body() createEventDto: CreateEventDto,
    @Req() req: any,
  ) {
    return this.orgService.createEvent(createEventDto, req.user.id);
  }

  /**
   * Completely purges an event tree profile entry based on its primary identity key.
   * Access: Restricted to accounts matching the ORGANIZER role.
   * @param eventId - The target event system record key.
   * @param req - The context mapping for ownership validation.
   */
  @UseGuards(UserGuard, RolesGuard)
  @Roles(Role.ORGANIZER)
  @Delete('deleteevent/:id')
  async deleteEvent(
    @Param('id') eventId: string,
    @Req() req: any,
  ) {
    return this.orgService.deleteEvent(eventId, req.user.id);
  }

  /**
   * Suspends visibility or operations of an active show sub-element inside a specific event structure.
   * Access: Restricted to accounts matching the ORGANIZER role.
   * @param eventId - The primary key of the container event entity.
   * @param showId - The specific unique scheduling timeline reference sequence.
   * @param req - Request context for author verification checks.
   */
  @UseGuards(UserGuard, RolesGuard)
  @Roles(Role.ORGANIZER)
  @Put('cancelshow/:eventId/:showId')
  async cancelShow(
    @Param('eventId') eventId: string,
    @Param('showId') showId: string,
    @Req() req: any,
  ) {
    return this.orgService.cancelShow(eventId, showId, req.user.id);
  }

  /**
   * Appends extra show times and facility limits to an existing event layout.
   * Access: Restricted to accounts matching the ORGANIZER role.
   * @param eventId - The targeted event tracking token block.
   * @param showData - The incoming unvalidated configuration fields map.
   * @param req - Request authority identification context block.
   */
  @UseGuards(UserGuard, RolesGuard)
  @Roles(Role.ORGANIZER)
  @Post('addshows/:id')
  async addShow(
    @Param('id') eventId: string,
    @Body() showData: any,
    @Req() req: any,
  ) {
    return this.orgService.addShow(eventId, showData, req.user.id);
  }
}