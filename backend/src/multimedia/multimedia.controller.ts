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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Multimedia')
@ApiBearerAuth()
@Controller('multimedia')
export class MultimediaController {
  constructor(private readonly multimediaService: MultimediaService) {}

  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Subir un archivo al servidor',
    description:
      'Permite cargar archivos multimedia. El archivo se asocia automáticamente al usuario que realiza la petición a través del token JWT.',
  })
  @ApiBody({
    description: 'Archivo multimedia (imagen, pdf, etc.)',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description:
      'Archivo subido exitosamente. Retorna la URL o ID del recurso generado.',
  })
  @ApiResponse({
    status: 400,
    description:
      'Error en la carga: formato no permitido o archivo demasiado pesado.',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado. Se requiere token JWT válido.',
  })
  upload(@UploadedFile() file: Express.Multer.File, @Req() req) {
    return this.multimediaService.upload(file, req.user);
  }
}
