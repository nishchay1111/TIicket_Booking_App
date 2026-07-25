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
import { FileInterceptor } from '@nestjs/platform-express';  // 👈 added
import { diskStorage } from 'multer';                         // 👈 added
import { extname } from 'path';                               // 👈 added
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

@Controller('organizers')
@UseInterceptors(ClassSerializerInterceptor)
export class OrganizersController {
  constructor(private readonly orgService: OrganizersService) {}

  // ─── Create Organizer ─────────────────────────────────────────────────
  @Public()
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post('createorganizer')
  async signup(
    @Body() createOrgDto: CreateOrganizerDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.orgService.createOrganizer(createOrgDto, res);
  }

  // ─── Organizer Login ──────────────────────────────────────────────────
  @Public()
  @Post('organizerlogin')
  async login(
    @Body() body: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.orgService.organizerLogin(body, res); // 👈 fixed method name
  }

  // ─── Organizer Logout ─────────────────────────────────────────────────
  @Public()
  @Post('logout')
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.orgService.logout(req, res);
  }

  // ─── Fetch Organizer Events ───────────────────────────────────────────
  @UseGuards(UserGuard, RolesGuard)
  @Roles(Role.ORGANIZER)
  @Get('fetchorganizersevents')
  async getEvents(@Req() req: any) {
    return this.orgService.fetchOrganizerEvents(req.user.id); // 👈 fixed method name
  }

  // ─── Upload Event Poster ──────────────────────────────────────────────
  @UseGuards(UserGuard, RolesGuard)
  @Roles(Role.ORGANIZER)
  @Post('uploadposter')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './DataStore/Posters', // 👈 save to DataStore/Posters
        filename: (req, file, cb) => {
          const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024, // 👈 5MB max
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

  // ─── Create Event ─────────────────────────────────────────────────────
  @UseGuards(UserGuard, RolesGuard)
  @Roles(Role.ORGANIZER)
  @Throttle({ default: { limit: 2, ttl: 600000 } })
  @Post('createEvent')
  async createEvent(
    @Body() createEventDto: CreateEventDto,
    @Req() req: any,
  ) {
    return this.orgService.createEvent(createEventDto, req.user.id); // 👈 pass only id
  }

  // ─── Delete Event ─────────────────────────────────────────────────────
  @UseGuards(UserGuard, RolesGuard)
  @Roles(Role.ORGANIZER)
  @Delete('deleteevent/:id')
  async deleteEvent(
    @Param('id') eventId: string,
    @Req() req: any,
  ) {
    return this.orgService.deleteEvent(eventId, req.user.id);
  }

  // ─── Cancel Show ──────────────────────────────────────────────────────
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

  // ─── Add Show ─────────────────────────────────────────────────────────
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