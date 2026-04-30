import { Test, TestingModule } from '@nestjs/testing';
import { NotificationRealtimeController } from './notification-realtime.controller';

describe('NotificationRealtimeController', () => {
  let controller: NotificationRealtimeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationRealtimeController],
    }).compile();

    controller = module.get<NotificationRealtimeController>(
      NotificationRealtimeController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
