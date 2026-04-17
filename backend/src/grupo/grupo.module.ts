import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Grupo } from './entities/grupo.entity';
import { GrupoService } from './grupo.service';
import { GrupoController } from './grupo.controller';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [TypeOrmModule.forFeature([Grupo]), MailModule],
  controllers: [GrupoController],
  providers: [GrupoService],
})
export class GrupoModule {}