import { Test, TestingModule } from '@nestjs/testing';
import { GestionProduitController } from './gestion-produit.controller';
import { GestionProduitService } from './gestion-produit.service';

describe('GestionProduitController', () => {
  let gestionProduitController: GestionProduitController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [GestionProduitController],
      providers: [GestionProduitService],
    }).compile();

    gestionProduitController = app.get<GestionProduitController>(GestionProduitController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(gestionProduitController.getHello()).toBe('Hello World!');
    });
  });
});
