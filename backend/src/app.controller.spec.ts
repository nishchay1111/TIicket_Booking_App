import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Reflector } from '@nestjs/core';

/**
 * Unit testing suite for the root AppController lifecycle.
 * Verifies core entry point responses and stubs global authorization dependencies.
 */
describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
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
    /**
     * Verifies that the base index route correctly delivers the application welcome string.
     */
    it('should return the welcome message', () => {
      expect(appController.getHello()).toBe('Welcome to the Ticket Booking App API!');
    });
  });
});