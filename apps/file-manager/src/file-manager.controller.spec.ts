import { Test, TestingModule } from '@nestjs/testing';
import { FileManagerController } from './file-manager.controller';
import { FileManagerService } from './file-manager.service';

describe('FileManagerController', () => {
  let fileManagerController: FileManagerController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [FileManagerController],
      providers: [FileManagerService],
    }).compile();

    fileManagerController = app.get<FileManagerController>(FileManagerController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(fileManagerController.getHello()).toBe('Hello World!');
    });
  });
});
