import { Test, TestingModule } from '@nestjs/testing';
import { NotificationRealtimeService } from './notification-realtime.service';

describe('NotificationRealtimeService', () => {
  let service: NotificationRealtimeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationRealtimeService],
    }).compile();

    service = module.get<NotificationRealtimeService>(NotificationRealtimeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
