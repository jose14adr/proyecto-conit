import { Controller, Post, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { extname } from 'path'
import { VimeoService } from './vimeo.service'

@Controller('videos')
export class VimeoController {
  constructor(private readonly vimeoService: VimeoService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('video', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const nombre = Date.now() + extname(file.originalname)
          cb(null, nombre)
        },
      }),
    }),
  )
  async subirVideo(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No se recibió ningún video')
    }

    const resultado = await this.vimeoService.subirVideo(file.path)
    return resultado
  }
}