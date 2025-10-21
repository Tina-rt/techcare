import { Module } from '@nestjs/common';
import { UtilisateurController } from './utilisateur.controller';
import { UtilisateurService } from './utilisateur.service';

@Module({
  imports: [],
  controllers: [UtilisateurController],
  providers: [UtilisateurService],
})
export class UtilisateurModule {}
