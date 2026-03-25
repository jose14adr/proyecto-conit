import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EntregasVideo } from './entities/entregas-video.entity';
import { EntregasVideoController } from './entregas-video.controller';
import { EntregasVideoService } from './entregas-video.service';

@Module({
  imports: [TypeOrmModule.forFeature([EntregasVideo])],
  controllers: [EntregasVideoController],
  providers: [EntregasVideoService]
})
export class EntregasVideoModule {}
