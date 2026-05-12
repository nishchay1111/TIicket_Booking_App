import { Test, TestingModule } from '@nestjs/testing';
import { TicketsService } from './tickets.service';
import { JsonStoreService } from '../common/json-store.service';

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