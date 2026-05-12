import { Test, TestingModule } from '@nestjs/testing';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { UserGuard } from '../user.guard';
import { RolesGuard } from '../RBAC/roles.guard'; // 👈 Import Guard
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

describe('TicketsController', () => {
  let controller: TicketsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TicketsController],
      providers: [
        {
          provide: TicketsService,
          useValue: { findTicketsByUser: jest.fn() },
        },
        // We provide a mock Reflector so the RolesGuard can run during tests
        {
          provide: Reflector,
          useValue: { getAllAndOverride: jest.fn().mockReturnValue(['user']) },
        },
      ],
    })
      .overrideGuard(UserGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const req = context.switchToHttp().getRequest();
          req.user = { id: 'test-user-uuid', role: 'user' }; // 👈 Add role to mock user
          return true;
        },
      })
      .overrideGuard(RolesGuard) // 👈 Optional: Override the RolesGuard if you want to bypass RBAC in tests
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<TicketsController>(TicketsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});