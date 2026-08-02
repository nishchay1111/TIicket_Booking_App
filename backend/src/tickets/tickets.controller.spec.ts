import { Test, TestingModule } from '@nestjs/testing';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { UserGuard } from '../user.guard';
import { RolesGuard } from '../RBAC/roles.guard';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

/**
 * Unit testing suite for the TicketsController lifecycle.
 * Validates initialization parameters and establishes mock authorization contexts.
 */
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
        {
          provide: Reflector,
          useValue: { getAllAndOverride: jest.fn().mockReturnValue(['user']) },
        },
      ],
    })
      .overrideGuard(UserGuard)
      .useValue({
        /**
         * Mocks execution contexts to attach authorized dummy user session state.
         * @param context - The simulated runtime framework execution environment.
         * @returns Absolute bypass authorization permission confirmation.
         */
        canActivate: (context: ExecutionContext) => {
          const req = context.switchToHttp().getRequest();
          req.user = { id: 'test-user-uuid', role: 'user' };
          return true;
        },
      })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<TicketsController>(TicketsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});