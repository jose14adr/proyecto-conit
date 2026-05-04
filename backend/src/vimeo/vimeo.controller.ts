import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { VimeoService } from './vimeo.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';

@ApiTags('Integración Vimeo')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('videos')
export class VimeoController {
  constructor(private readonly vimeoService: VimeoService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('video', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const nombre = `${Date.now()}${extname(file.originalname)}`;
          cb(null, nombre);
        },
      }),
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Subir video a Vimeo',
    description:
      'Recibe un archivo de video, lo guarda temporalmente en el servidor y luego lo transfiere a la cuenta de Vimeo vinculada.',
  })
  @ApiBody({
    description: 'Archivo de video a cargar (mp4, mov, avi, etc.)',
    schema: {
      type: 'object',
      properties: {
        video: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['video'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Video subido con éxito. Retorna el URI y el enlace de Vimeo.',
  })
  @ApiResponse({
    status: 400,
    description:
      'Error en la petición: No se recibió el video o formato inválido.',
  })
  async subirVideo(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No se recibió ningún video');
    }

    // El servicio procesa el archivo desde la ruta temporal en ./uploads
    const resultado = await this.vimeoService.subirVideo(file.path);
    return resultado;
  }
}
