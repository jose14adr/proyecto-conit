import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MultimediaService } from './multimedia.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';

@Controller('multimedia')
export class MultimediaController {
  constructor(private readonly multimediaService: MultimediaService) {}

  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file')) // 🔥 ESTO FALTABA
  upload(
    @UploadedFile() file: Express.Multer.File,
    @Req() req,
  ) {
    return this.multimediaService.upload(file, req.user);
  }
}