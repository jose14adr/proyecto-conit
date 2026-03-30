import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeccionMaterial } from './entities/leccion-material.entity';
import { LeccionMaterialController } from './leccion-material.controller';
import { LeccionMaterialService } from './leccion-material.service';

@Module({
  imports: [TypeOrmModule.forFeature([LeccionMaterial])],
  exports: [TypeOrmModule],
  controllers: [LeccionMaterialController],
  providers: [LeccionMaterialService]
})
export class LeccionMaterialModule {}
