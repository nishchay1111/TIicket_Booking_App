import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Reflector } from '@nestjs/core'; // 👈 Import Reflector

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        // 👈 Provide a mock Reflector to prevent RolesGuard from crashing the test
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return the welcome message', () => {
      expect(appController.getHello()).toBe('Welcome to the Ticket Booking App API!');
    });
  });
});