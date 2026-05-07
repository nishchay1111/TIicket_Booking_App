import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('admin') // This makes the route /api/admin
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  getStats() {
    return this.adminService.getAdminStats();
  }
}