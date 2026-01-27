import { Test, TestingModule } from '@nestjs/testing';
import { NotificationManagerController } from './notification-manager.controller';
import { NotificationManagerService } from './notification-manager.service';

describe('NotificationManagerController', () => {
  let notificationManagerController: NotificationManagerController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [NotificationManagerController],
      providers: [NotificationManagerService],
    }).compile();

    notificationManagerController = app.get<NotificationManagerController>(NotificationManagerController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(notificationManagerController.getHello()).toBe('Hello World!');
    });
  });
});
