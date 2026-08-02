import { Injectable } from '@nestjs/common';
import { JsonStoreService } from '../common/json-store.service';

@Injectable()
export class AdminService {
  constructor(private readonly jsonStore: JsonStoreService) {}

  getAdminStats() {
    return {
      message: "Admin stats logic will go here",
      timestamp: new Date().toISOString()
    };
  }
}