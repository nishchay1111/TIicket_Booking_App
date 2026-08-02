import { Test, TestingModule } from '@nestjs/testing';
import { TicketsService } from './tickets.service';
import { JsonStoreService } from '../common/json-store.service';

/**
 * Unit testing suite for the TicketsService orchestration layer.
 * Verifies service initialization and establishes core data layer mock behaviors.
 */
describe('TicketsService', () => {
  let service: TicketsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketsService,
        {
          provide: JsonStoreService,
          useValue: { 
            loadData: jest.fn().mockReturnValue([]), 
            saveData: jest.fn() 
          },
        },
      ],
    }).compile();

    service = module.get<TicketsService>(TicketsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});