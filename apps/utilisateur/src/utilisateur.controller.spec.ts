import { Test, TestingModule } from '@nestjs/testing';
import { UtilisateurController } from './utilisateur.controller';
import { UtilisateurService } from './utilisateur.service';

describe('UtilisateurController', () => {
  let utilisateurController: UtilisateurController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [UtilisateurController],
      providers: [UtilisateurService],
    }).compile();

    utilisateurController = app.get<UtilisateurController>(UtilisateurController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(utilisateurController.getHello()).toBe('Hello World!');
    });
  });
});
