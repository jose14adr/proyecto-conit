import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Res,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { CertificadoService } from './certificado.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Certificados')
@ApiBearerAuth()
@Controller('certificado')
export class CertificadoController {
  constructor(private readonly certificadoService: CertificadoService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar todos los certificados (Admin)',
    description:
      'Retorna una lista de todos los certificados emitidos en el sistema. Solo accesible para administradores.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de certificados obtenida correctamente.',
  })
  findAll() {
    return this.certificadoService.findAll();
  }

  @Get('alumno/:idalumno')
  @ApiOperation({
    summary: 'Listar certificados obtenidos por un alumno',
    description:
      'Retorna una lista de certificados obtenidos por un alumno específico.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de certificados del alumno obtenida correctamente.',
  })
  @ApiParam({ name: 'idalumno', description: 'ID del alumno' })
  findByAlumno(@Param('idalumno', ParseIntPipe) idalumno: number) {
    return this.certificadoService.findByAlumno(idalumno);
  }

  @Get('alumno/:idalumno/disponibles')
  @ApiOperation({
    summary: 'Listar certificados que el alumno ya puede generar/descargar',
    description:
      'Retorna una lista de certificados que el alumno ya puede generar o descargar.',
  })
  @ApiResponse({
    status: 200,
    description:
      'Lista de certificados disponibles para el alumno obtenida correctamente.',
  })
  getCertificadosDisponiblesAlumno(
    @Param('idalumno', ParseIntPipe) idalumno: number,
  ) {
    return this.certificadoService.getCertificadosDisponiblesAlumno(idalumno);
  }

  @Get('admin/listado')
  @ApiOperation({
    summary: 'Listado avanzado de certificados para panel administrativo',
    description:
      'Retorna un listado de certificados con filtros avanzados para su gestión en el panel administrativo.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de certificados obtenida correctamente.',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Búsqueda por nombre o código',
  })
  @ApiQuery({ name: 'dni', required: false })
  @ApiQuery({ name: 'curso', required: false })
  @ApiQuery({ name: 'estado', required: false, enum: ['EMITIDO', 'ANULADO'] })
  getCertificadosAdmin(
    @Query('search') search?: string,
    @Query('dni') dni?: string,
    @Query('curso') curso?: string,
    @Query('estado') estado?: string,
    @Query('anulado') anulado?: string,
  ) {
    return this.certificadoService.getCertificadosAdmin({
      search,
      dni,
      curso,
      estado,
      anulado,
    });
  }

  @Put(':id/anular')
  @ApiOperation({
    summary: 'Anular un certificado emitido',
    description:
      'Anula un certificado específico por su ID, registrando un motivo opcional.',
  })
  @ApiResponse({
    status: 200,
    description: 'Certificado anulado correctamente.',
  })
  @ApiResponse({
    status: 404,
    description: 'No se encontró el certificado a anular.',
  })
  @ApiParam({ name: 'id', description: 'ID numérico del certificado a anular' })
  @ApiBody({
    schema: {
      properties: {
        motivo: { type: 'string', example: 'Error en datos del alumno' },
      },
    },
  })
  anularCertificado(
    @Param('id', ParseIntPipe) id: number,
    @Body() body?: { motivo?: string },
  ) {
    return this.certificadoService.anularCertificado(id, body);
  }

  @Get('alumno/:idalumno/cursos-matriculados')
  @ApiOperation({
    summary: 'Verificar cursos aptos para certificación por alumno',
    description:
      'Retorna una lista de cursos en los que el alumno está matriculado y ha cumplido los requisitos para obtener un certificado.',
  })
  @ApiResponse({
    status: 200,
    description:
      'Lista de cursos con estado de cumplimiento para certificación.',
  })
  getCursosMatriculadosYCompletosPorAlumno(
    @Param('idalumno', ParseIntPipe) idalumno: number,
  ) {
    return this.certificadoService.getCursosMatriculadosYCompletosPorAlumno(
      idalumno,
    );
  }

  @Get('alumno/:idalumno/certificado/:id/descargar')
  @ApiOperation({
    summary: 'Descargar PDF de certificado (Descarga única)',
    description:
      'Permite descargar el PDF de un certificado específico para un alumno. Esta descarga solo se permite una vez por certificado.',
  })
  @ApiResponse({
    status: 200,
    description: 'Retorna el archivo PDF',
    content: { 'application/pdf': {} },
  })
  async descargarCertificadoAlumnoUnaVez(
    @Param('idalumno', ParseIntPipe) idalumno: number,
    @Param('id', ParseIntPipe) id: number,
    @Res({ passthrough: true }) res: Response,
  ) {
    const archivo =
      await this.certificadoService.descargarCertificadoAlumnoUnaVez(
        id,
        idalumno,
      );

    res.setHeader('Content-Type', archivo.contentType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${archivo.fileName}"`,
    );

    return new StreamableFile(archivo.buffer);
  }

  @Get('plantilla')
  @ApiOperation({
    summary: 'Listar todas las plantillas de diseño de certificados',
    description:
      'Retorna una lista de todas las plantillas de diseño de certificados disponibles en el sistema.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de plantillas de diseño obtenida correctamente.',
  })
  findAllPlantillas() {
    return this.certificadoService.findAllPlantillas();
  }

  @Get('plantilla/activa')
  @ApiOperation({
    summary: 'Obtener la plantilla de diseño actualmente activa',
    description:
      'Retorna la plantilla de diseño de certificado que está actualmente activa para su uso en la emisión de certificados.',
  })
  @ApiResponse({
    status: 200,
    description: 'Plantilla de diseño activa obtenida correctamente.',
  })
  findPlantillaActiva() {
    return this.certificadoService.findPlantillaActiva();
  }

  @Get('config/curso/:idcurso')
  @ApiOperation({
    summary: 'Obtener reglas de certificación de un curso',
    description:
      'Retorna las reglas y configuraciones de certificación asociadas a un curso específico.',
  })
  @ApiResponse({
    status: 200,
    description: 'Configuración de certificación obtenida correctamente.',
  })
  getConfigByCurso(@Param('idcurso', ParseIntPipe) idcurso: number) {
    return this.certificadoService.getConfigByCurso(idcurso);
  }

  @Put('config/curso/:idcurso')
  @ApiOperation({
    summary: 'Actualizar reglas de certificación de un curso',
    description:
      'Actualiza las reglas y configuraciones de certificación asociadas a un curso específico.',
  })
  @ApiResponse({
    status: 200,
    description: 'Configuración de certificación actualizada correctamente.',
  })
  @ApiResponse({
    status: 404,
    description: 'No se encontró el curso para actualizar su configuración.',
  })
  saveConfigByCurso(
    @Param('idcurso', ParseIntPipe) idcurso: number,
    @Body()
    body: {
      habilitado?: boolean;
      modoEntrega: 'EMAIL' | 'DESCARGA_UNICA';
      plantillaId?: number | null;
      requiereAprobacion?: boolean;
      notaMinima?: number | null;
      asistenciaMinima?: number | null;
      progresoMinimo?: number | null;
      requiereExamenAprobado?: boolean;
      requiereProgresoCompleto?: boolean;
      soloCursosCompletosEnEmision?: boolean;
    },
  ) {
    return this.certificadoService.saveConfigByCurso(idcurso, body);
  }

  @Post('emitir')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Emitir un certificado manualmente subiendo el PDF',
    description:
      'Permite emitir un certificado subiendo manualmente el archivo PDF generado, junto con los datos necesarios para su registro.',
  })
  @ApiResponse({
    status: 201,
    description: 'Certificado emitido y registrado correctamente.',
  })
  @ApiResponse({
    status: 400,
    description: 'Faltan datos obligatorios o el archivo no es un PDF válido.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        idalumno: { type: 'string' },
        idcurso: { type: 'string' },
        codigoCertificado: { type: 'string' },
      },
    },
  })
  emitirCertificado(
    @UploadedFile() file: Express.Multer.File,
    @Body()
    body: {
      idalumno?: number | string;
      idcurso?: number | string;
      curso?: string;
      horas?: number | string;
      creditos?: number | string;
      fechaEmision?: string;
      codigoCertificado?: string;
      origen?: string;
      emailAlumno?: string;
      nombreAlumno?: string;
      dniAlumno?: string;
    },
  ) {
    if (!file) {
      throw new BadRequestException('Debes enviar el PDF del certificado');
    }

    return this.certificadoService.emitirCertificado(file, body);
  }

  @Get(':id/archivo')
  @ApiOperation({
    summary: 'Visualizar el archivo PDF de un certificado generado',
    description:
      'Retorna el archivo PDF de un certificado específico para su visualización en el navegador.',
  })
  @ApiResponse({
    status: 200,
    description: 'Retorna el archivo PDF',
    content: { 'application/pdf': {} },
  })
  @ApiParam({ name: 'id', description: 'ID numérico del certificado' })
  async getArchivoCertificado(
    @Param('id', ParseIntPipe) id: number,
    @Res({ passthrough: true }) res: Response,
  ) {
    const archivo =
      await this.certificadoService.getGeneratedCertificadoFile(id);

    res.setHeader('Content-Type', archivo.contentType);
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${archivo.fileName}"`,
    );

    return new StreamableFile(archivo.buffer);
  }

  @Get('validar/:codigo')
  @ApiOperation({
    summary: 'Validación pública de certificado por código QR/alfanumérico',
    description:
      'Permite validar la autenticidad de un certificado ingresando su código único (puede ser leído desde un QR). Retorna información básica del certificado y su estado de validez.',
  })
  @ApiResponse({
    status: 200,
    description: 'Certificado válido y auténtico.',
  })
  @ApiResponse({
    status: 404,
    description: 'Certificado no encontrado o inválido.',
  })
  validarCertificadoPorCodigo(@Param('codigo') codigo: string) {
    return this.certificadoService.validarCertificadoPorCodigo(codigo);
  }

  @Get('plantilla/asset')
  @ApiOperation({
    summary: 'Obtener recursos visuales de la plantilla (logos, fondos)',
    description:
      'Permite obtener los recursos visuales asociados a las plantillas de certificados, como logos o fondos, mediante una clave única.',
  })
  @ApiResponse({
    status: 200,
    description: 'Archivo de recurso obtenido correctamente.',
  })
  @ApiResponse({
    status: 400,
    description: 'Falta el parámetro key o es inválido.',
  })
  async getPlantillaAsset(
    @Query('key') key: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!key) {
      throw new BadRequestException('El parámetro key es obligatorio');
    }

    const archivo = await this.certificadoService.getPlantillaAsset(key);

    res.setHeader('Content-Type', archivo.contentType);
    res.setHeader('Cache-Control', 'private, max-age=300');

    return new StreamableFile(archivo.buffer);
  }

  @Post('plantilla/upload-file')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Subir archivo de recurso para diseño de plantilla',
    description:
      'Permite subir un archivo que será utilizado como recurso visual en las plantillas de certificados, como un logo o fondo.',
  })
  @ApiResponse({
    status: 201,
    description: 'Archivo de recurso subido correctamente.',
  })
  @ApiResponse({
    status: 400,
    description: 'Faltan datos obligatorios o el archivo no es válido.',
  })
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Debes enviar un archivo');
    }

    return this.certificadoService.uploadPlantillaAsset(file);
  }

  @Post('plantilla/upload-url')
  @ApiOperation({
    summary: 'Obtener URL de subida para recurso de plantilla',
    description:
      'Genera una URL de subida temporal para subir un recurso visual que será utilizado en las plantillas de certificados.',
  })
  createUploadUrl(@Body() body: { fileName: string; contentType: string }) {
    return this.certificadoService.createBackgroundUploadUrl(
      body.fileName,
      body.contentType,
    );
  }

  @Put('plantilla/:id/activar')
  @ApiOperation({
    summary: 'Activar una plantilla de certificado',
    description:
      'Activa una plantilla de certificado específica para su uso en la generación de certificados.',
  })
  @ApiResponse({
    status: 200,
    description: 'Plantilla activada correctamente.',
  })
  @ApiResponse({
    status: 404,
    description: 'Plantilla no encontrada.',
  })
  activatePlantilla(@Param('id', ParseIntPipe) id: number) {
    return this.certificadoService.activatePlantilla(id);
  }

  @Delete('plantilla/:id')
  @ApiOperation({
    summary: 'Eliminar una plantilla de certificado',
    description:
      'Elimina una plantilla de certificado específica y todos los recursos asociados.',
  })
  @ApiResponse({
    status: 200,
    description: 'Plantilla eliminada correctamente.',
  })
  @ApiResponse({
    status: 404,
    description: 'Plantilla no encontrada.',
  })
  deletePlantilla(@Param('id', ParseIntPipe) id: number) {
    return this.certificadoService.deletePlantilla(id);
  }

  @Post('verificar-emision')
  @ApiOperation({
    summary: 'Verificar y preparar la emisión de un certificado',
    description:
      'Verifica la información del alumno y grupo, y prepara la emisión de un certificado.',
  })
  @ApiResponse({
    status: 200,
    description: 'Emisión preparada correctamente.',
  })
  @ApiResponse({
    status: 404,
    description: 'Alumno o grupo no encontrado.',
  })
  verificarYPrepararEmision(
    @Body()
    body: {
      idalumno: number;
      idgrupo: number;
    },
  ) {
    return this.certificadoService.verificarYPrepararEmision(body);
  }

  @Post('plantilla')
  @ApiOperation({
    summary: 'Crear nueva plantilla de diseño',
    description:
      'Crea una nueva plantilla de diseño para la generación de certificados.',
  })
  createPlantilla(
    @Body()
    body: {
      nombre: string;
      activa?: boolean;
      fondoKey?: string | null;
      canvasWidth?: number;
      canvasHeight?: number;
      configJson?: any[];
      dobleCara?: boolean;
      configJsonReverso?: any[];
    },
  ) {
    return this.certificadoService.createPlantilla(body);
  }

  @Put('plantilla/:id')
  @ApiOperation({
    summary: 'Actualizar una plantilla de certificado',
    description:
      'Actualiza los detalles de una plantilla de certificado específica.',
  })
  @ApiResponse({
    status: 200,
    description: 'Plantilla actualizada correctamente.',
  })
  @ApiResponse({
    status: 404,
    description: 'Plantilla no encontrada.',
  })
  updatePlantilla(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: {
      nombre: string;
      activa?: boolean;
      fondoKey?: string | null;
      canvasWidth?: number;
      canvasHeight?: number;
      configJson?: any[];
      dobleCara?: boolean;
      configJsonReverso?: any[];
    },
  ) {
    return this.certificadoService.updatePlantilla(id, body);
  }
}
