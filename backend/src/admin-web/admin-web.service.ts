import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Curso } from '../curso/entities/curso.entity';
import { CategoriaCurso } from '../categoria-curso/categoria-curso.entity';
import { CursoCategoriaWeb } from '../categoria-curso/curso-categoria-web.entity';
import { WebContenido } from '../web/entities/web-contenido.entity';
import { MensajeContacto } from '../web/entities/mensaje-contacto.entity';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import { extname } from 'path';
import { WebMedia } from '../web/entities/web-media.entity';
import { WebPagina } from '../web/entities/web-pagina.entity';

@Injectable()
export class AdminWebService {
  constructor(
    @InjectRepository(Curso)
    private readonly cursoRepo: Repository<Curso>,

    @InjectRepository(CategoriaCurso)
    private readonly categoriaRepo: Repository<CategoriaCurso>,

    @InjectRepository(CursoCategoriaWeb)
    private readonly cursoCategoriaRepo: Repository<CursoCategoriaWeb>,

    @InjectRepository(WebContenido)
    private readonly webContenidoRepo: Repository<WebContenido>,

    @InjectRepository(MensajeContacto)
    private readonly mensajeContactoRepo: Repository<MensajeContacto>,

    @InjectRepository(WebMedia)
    private readonly webMediaRepo: Repository<WebMedia>,

    @InjectRepository(WebPagina)
    private readonly webPaginaRepo: Repository<WebPagina>,
  ) {}

  private normalizarSlug(texto: string) {
    return String(texto || '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private mapCategoria(categoria: CategoriaCurso) {
    return {
      id: categoria.id,
      nombre: categoria.nombre,
      slug: categoria.slug,
      descripcion: categoria.descripcion,
      imagenUrl: categoria.imagen_url,
      visibleWeb: categoria.visible_web,
      estado: categoria.estado,
      orden: categoria.orden,
      createdAt: categoria.created_at,
      updatedAt: categoria.updated_at,
    };
  }

  private mapCursoAdmin(curso: Curso, categorias: CategoriaCurso[] = []) {
    return {
      id: curso.id,
      nombrecurso: curso.nombrecurso,
      descripcion: curso.descripcion,
      contenidomultimedia: curso.contenidomultimedia,
      publicoobjetivo: curso.publicoobjetivo,
      duracion: curso.duracion,
      creditos: curso.creditos,
      nivel: curso.nivel,
      estado: curso.estado,
      precio: curso.precio,
      descuento: curso.descuento,
      precio_final: curso.precio_final,
      tiemposemana: curso.tiemposemana,

      visible_web: curso.visible_web,
      destacado_web: curso.destacado_web,
      imagen_url: curso.imagen_url,
      slug: curso.slug,
      orden_web: curso.orden_web,
      etiqueta_web: curso.etiqueta_web,
      resumen_web: curso.resumen_web,
      requisitos_web: curso.requisitos_web,
      beneficios_web: curso.beneficios_web || [],
      actualizado_web: curso.actualizado_web,

      categorias: categorias.map((categoria) => this.mapCategoria(categoria)),
    };
  }

  private parseBeneficios(value: any): any[] {
    if (Array.isArray(value)) {
      return value.filter((item) => String(item || '').trim() !== '');
    }

    if (typeof value === 'string') {
      return value
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean);
    }

    return [];
  }

  private mapMensajeContacto(mensaje: MensajeContacto) {
    return {
      id: mensaje.id,
      nombre: mensaje.nombre,
      correo: mensaje.correo,
      asunto: mensaje.asunto,
      mensaje: mensaje.mensaje,
      estado: mensaje.estado,
      leido: mensaje.leido,
      created_at: mensaje.created_at,
      updated_at: mensaje.updated_at,
    };
  }

  private getS3Client() {
    return new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
    });
  }

  private getS3Bucket() {
    return (
      process.env.AWS_S3_BUCKET ||
      process.env.AWS_BUCKET_NAME ||
      process.env.S3_BUCKET ||
      ''
    );
  }

  private buildPublicS3Url(key: string) {
    const bucket = this.getS3Bucket();
    const region = process.env.AWS_REGION || 'us-east-1';

    return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
  }

  private normalizarNombreArchivo(nombre: string) {
    const extension = extname(nombre || '').toLowerCase();

    const base = String(nombre || 'imagen')
      .replace(extension, '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    return `${base || 'imagen'}-${randomUUID()}${extension || '.jpg'}`;
  }

  private mapWebMedia(media: WebMedia) {
    return {
      id: media.id,
      nombreOriginal: media.nombre_original,
      nombreArchivo: media.nombre_archivo,
      archivoUrl: media.archivo_url,
      archivoKey: media.archivo_key,
      mimeType: media.mime_type,
      sizeBytes: media.size_bytes,
      carpeta: media.carpeta,
      estado: media.estado,
      createdAt: media.created_at,
      updatedAt: media.updated_at,
    };
  }

  private mapWebPagina(pagina: WebPagina) {
    return {
      id: pagina.id,
      titulo: pagina.titulo,
      slug: pagina.slug,
      ruta: pagina.ruta,
      tipo: pagina.tipo,
      descripcion: pagina.descripcion,
      visible_menu: pagina.visible_menu,
      publicada: pagina.publicada,
      protegida: pagina.protegida,
      orden: pagina.orden,
      seo_title: pagina.seo_title,
      seo_description: pagina.seo_description,
      contenido: pagina.contenido || { secciones: [] },
      created_at: pagina.created_at,
      updated_at: pagina.updated_at,
    };
  }

  private construirRutaPagina(slug: string) {
    if (slug === 'inicio') return '/web';
    return `/web/${slug}`;
  }

  async listarPaginasAdmin() {
    const paginas = await this.webPaginaRepo.find({
      order: {
        orden: 'ASC',
        titulo: 'ASC',
      },
    });

    return paginas.map((pagina) => this.mapWebPagina(pagina));
  }

  async crearPaginaAdmin(data: any) {
    const titulo = String(data?.titulo || '').trim();

    if (!titulo) {
      throw new BadRequestException('El título de la página es obligatorio');
    }

    const slug = this.normalizarSlug(data?.slug || titulo);

    if (!slug) {
      throw new BadRequestException('No se pudo generar el slug de la página');
    }

    const existeSlug = await this.webPaginaRepo.findOne({
      where: { slug },
    });

    if (existeSlug) {
      throw new BadRequestException('Ya existe una página con ese slug');
    }

    const ruta = data?.ruta
      ? String(data.ruta).trim()
      : this.construirRutaPagina(slug);

    const existeRuta = await this.webPaginaRepo.findOne({
      where: { ruta },
    });

    if (existeRuta) {
      throw new BadRequestException('Ya existe una página con esa ruta');
    }

    const pagina = this.webPaginaRepo.create({
      titulo,
      slug,
      ruta,
      tipo: data?.tipo || 'personalizada',
      descripcion: data?.descripcion || null,
      visible_menu: data?.visible_menu ?? true,
      publicada: data?.publicada ?? true,
      protegida: false,
      orden: Number(data?.orden || 1),
      seo_title: data?.seo_title || titulo,
      seo_description: data?.seo_description || data?.descripcion || null,
      contenido: data?.contenido || { secciones: [] },
      updated_at: new Date(),
    });

    const guardada = await this.webPaginaRepo.save(pagina);

    return this.mapWebPagina(guardada);
  }

  async actualizarPaginaAdmin(id: number, data: any) {
    const pagina = await this.webPaginaRepo.findOne({
      where: { id },
    });

    if (!pagina) {
      throw new NotFoundException('Página no encontrada');
    }

    if (data?.titulo !== undefined) {
      const titulo = String(data.titulo || '').trim();

      if (!titulo) {
        throw new BadRequestException('El título no puede estar vacío');
      }

      pagina.titulo = titulo;
    }

    if (data?.slug !== undefined) {
      const nuevoSlug = this.normalizarSlug(data.slug);

      if (!nuevoSlug) {
        throw new BadRequestException('El slug no puede estar vacío');
      }

      if (nuevoSlug !== pagina.slug) {
        const existeSlug = await this.webPaginaRepo.findOne({
          where: { slug: nuevoSlug },
        });

        if (existeSlug && existeSlug.id !== pagina.id) {
          throw new BadRequestException('Ya existe una página con ese slug');
        }
      }

      pagina.slug = nuevoSlug;

      if (!pagina.protegida) {
        pagina.ruta = this.construirRutaPagina(nuevoSlug);
      }
    }

    if (data?.ruta !== undefined && !pagina.protegida) {
      const nuevaRuta = String(data.ruta || '').trim();

      if (!nuevaRuta.startsWith('/web')) {
        throw new BadRequestException('La ruta debe iniciar con /web');
      }

      if (nuevaRuta !== pagina.ruta) {
        const existeRuta = await this.webPaginaRepo.findOne({
          where: { ruta: nuevaRuta },
        });

        if (existeRuta && existeRuta.id !== pagina.id) {
          throw new BadRequestException('Ya existe una página con esa ruta');
        }
      }

      pagina.ruta = nuevaRuta;
    }

    if (data?.descripcion !== undefined) {
      pagina.descripcion = data.descripcion || null;
    }

    if (data?.visible_menu !== undefined) {
      pagina.visible_menu = Boolean(data.visible_menu);
    }

    if (data?.publicada !== undefined) {
      pagina.publicada = Boolean(data.publicada);
    }

    if (data?.orden !== undefined) {
      pagina.orden = Number(data.orden || 1);
    }

    if (data?.seo_title !== undefined) {
      pagina.seo_title = data.seo_title || null;
    }

    if (data?.seo_description !== undefined) {
      pagina.seo_description = data.seo_description || null;
    }

    if (data?.contenido !== undefined) {
      pagina.contenido = data.contenido || { secciones: [] };
    }

    pagina.updated_at = new Date();

    const actualizada = await this.webPaginaRepo.save(pagina);

    return this.mapWebPagina(actualizada);
  }

  async eliminarPaginaAdmin(id: number) {
    const pagina = await this.webPaginaRepo.findOne({
      where: { id },
    });

    if (!pagina) {
      throw new NotFoundException('Página no encontrada');
    }

    if (pagina.protegida) {
      pagina.publicada = false;
      pagina.visible_menu = false;
      pagina.updated_at = new Date();

      const actualizada = await this.webPaginaRepo.save(pagina);

      return {
        message:
          'La página está protegida, por eso solo fue despublicada y ocultada del menú',
        pagina: this.mapWebPagina(actualizada),
      };
    }

    await this.webPaginaRepo.delete(id);

    return {
      message: 'Página eliminada correctamente',
    };
  }

  async listarMediosWeb() {
    const medios = await this.webMediaRepo.find({
      where: {
        estado: true,
      },
      order: {
        created_at: 'DESC',
        id: 'DESC',
      },
    });

    return medios.map((media) => this.mapWebMedia(media));
  }

  async subirMedioWeb(file: any, data: any) {
    if (!file) {
      throw new BadRequestException('Debes seleccionar una imagen');
    }

    const mimeType = String(file.mimetype || '');

    if (!mimeType.startsWith('image/')) {
      throw new BadRequestException('Solo se permiten imágenes');
    }

    const bucket = this.getS3Bucket();

    if (!bucket) {
      throw new BadRequestException(
        'No se encontró el bucket S3. Revisa AWS_S3_BUCKET o AWS_BUCKET_NAME',
      );
    }

    const carpeta = String(data?.carpeta || 'web')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9/_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const nombreArchivo = this.normalizarNombreArchivo(file.originalname);
    const key = `${carpeta || 'web'}/${nombreArchivo}`;

    const s3 = this.getS3Client();

    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: file.buffer,
        ContentType: mimeType,
      }),
    );

    const archivoUrl = this.buildPublicS3Url(key);

    const media = this.webMediaRepo.create({
      nombre_original: file.originalname,
      nombre_archivo: nombreArchivo,
      archivo_url: archivoUrl,
      archivo_key: key,
      mime_type: mimeType,
      size_bytes: Number(file.size || 0),
      carpeta: carpeta || 'web',
      estado: true,
      updated_at: new Date(),
    });

    const guardado = await this.webMediaRepo.save(media);

    return this.mapWebMedia(guardado);
  }

  async eliminarMedioWeb(id: number) {
    const media = await this.webMediaRepo.findOne({
      where: { id },
    });

    if (!media) {
      throw new NotFoundException('Imagen no encontrada');
    }

    media.estado = false;
    media.updated_at = new Date();

    const actualizada = await this.webMediaRepo.save(media);

    // Opcional: intenta borrar de S3 también.
    // Si falla, igual dejamos la imagen oculta en base de datos.
    try {
      const bucket = this.getS3Bucket();

      if (bucket && media.archivo_key) {
        const s3 = this.getS3Client();

        await s3.send(
          new DeleteObjectCommand({
            Bucket: bucket,
            Key: media.archivo_key,
          }),
        );
      }
    } catch (error) {
      console.warn('No se pudo eliminar el archivo de S3:', error);
    }

    return {
      message: 'Imagen eliminada correctamente',
      media: this.mapWebMedia(actualizada),
    };
  }

  async listarMensajesContacto() {
    const mensajes = await this.mensajeContactoRepo.find({
      order: {
        created_at: 'DESC',
        id: 'DESC',
      },
    });

    return mensajes.map((mensaje) => this.mapMensajeContacto(mensaje));
  }

  async marcarMensajeContactoLeido(id: number) {
    const mensaje = await this.mensajeContactoRepo.findOne({
      where: { id },
    });

    if (!mensaje) {
      throw new NotFoundException('Mensaje no encontrado');
    }

    mensaje.leido = true;
    mensaje.updated_at = new Date();

    const actualizado = await this.mensajeContactoRepo.save(mensaje);

    return {
      message: 'Mensaje marcado como leído',
      mensaje: this.mapMensajeContacto(actualizado),
    };
  }

  async actualizarEstadoMensajeContacto(id: number, data: any) {
    const mensaje = await this.mensajeContactoRepo.findOne({
      where: { id },
    });

    if (!mensaje) {
      throw new NotFoundException('Mensaje no encontrado');
    }

    const estado = String(data?.estado || '').trim().toUpperCase();

    const estadosPermitidos = [
      'PENDIENTE',
      'EN_REVISION',
      'RESPONDIDO',
      'ARCHIVADO',
    ];

    if (!estadosPermitidos.includes(estado)) {
      throw new BadRequestException('Estado de mensaje no válido');
    }

    mensaje.estado = estado;

    if (estado === 'RESPONDIDO' || estado === 'ARCHIVADO') {
      mensaje.leido = true;
    }

    mensaje.updated_at = new Date();

    const actualizado = await this.mensajeContactoRepo.save(mensaje);

    return {
      message: 'Estado del mensaje actualizado',
      mensaje: this.mapMensajeContacto(actualizado),
    };
  }

  async listarCategorias() {
    const categorias = await this.categoriaRepo.find({
      order: {
        orden: 'ASC',
        nombre: 'ASC',
      },
    });

    return categorias.map((categoria) => this.mapCategoria(categoria));
  }

  async crearCategoria(data: any) {
    const nombre = String(data?.nombre || '').trim();

    if (!nombre) {
      throw new BadRequestException('El nombre de la categoría es obligatorio');
    }

    const slug = this.normalizarSlug(data?.slug || nombre);

    if (!slug) {
      throw new BadRequestException('No se pudo generar el slug de la categoría');
    }

    const existeSlug = await this.categoriaRepo.findOne({
      where: { slug },
    });

    if (existeSlug) {
      throw new BadRequestException('Ya existe una categoría con ese slug');
    }

    const categoria = this.categoriaRepo.create({
      nombre,
      slug,
      descripcion: data?.descripcion ?? null,
      imagen_url: data?.imagen_url ?? null,
      visible_web: data?.visible_web ?? true,
      estado: data?.estado ?? true,
      orden: Number(data?.orden ?? 1),
      updated_at: new Date(),
    });

    const guardada = await this.categoriaRepo.save(categoria);

    return this.mapCategoria(guardada);
  }

  async actualizarCategoria(id: number, data: any) {
    const categoria = await this.categoriaRepo.findOne({
      where: { id },
    });

    if (!categoria) {
      throw new NotFoundException('Categoría no encontrada');
    }

    if (data?.nombre !== undefined) {
      const nombre = String(data.nombre || '').trim();

      if (!nombre) {
        throw new BadRequestException('El nombre no puede estar vacío');
      }

      categoria.nombre = nombre;
    }

    if (data?.slug !== undefined || data?.nombre !== undefined) {
      const nuevoSlug = this.normalizarSlug(data?.slug || categoria.nombre);

      if (!nuevoSlug) {
        throw new BadRequestException('El slug no puede estar vacío');
      }

      if (nuevoSlug !== categoria.slug) {
        const existeSlug = await this.categoriaRepo.findOne({
          where: { slug: nuevoSlug },
        });

        if (existeSlug && existeSlug.id !== categoria.id) {
          throw new BadRequestException('Ya existe una categoría con ese slug');
        }
      }

      categoria.slug = nuevoSlug;
    }

    if (data?.descripcion !== undefined) {
      categoria.descripcion = data.descripcion || null;
    }

    if (data?.imagen_url !== undefined) {
      categoria.imagen_url = data.imagen_url || null;
    }

    if (data?.visible_web !== undefined) {
      categoria.visible_web = Boolean(data.visible_web);
    }

    if (data?.estado !== undefined) {
      categoria.estado = Boolean(data.estado);
    }

    if (data?.orden !== undefined) {
      categoria.orden = Number(data.orden || 1);
    }

    categoria.updated_at = new Date();

    const actualizada = await this.categoriaRepo.save(categoria);

    return this.mapCategoria(actualizada);
  }

  async eliminarCategoria(id: number) {
    const categoria = await this.categoriaRepo.findOne({
      where: { id },
    });

    if (!categoria) {
      throw new NotFoundException('Categoría no encontrada');
    }

    // No borramos físicamente para no perder relaciones.
    // La ocultamos de la web y la dejamos inactiva.
    categoria.estado = false;
    categoria.visible_web = false;
    categoria.updated_at = new Date();

    const actualizada = await this.categoriaRepo.save(categoria);

    return {
      message: 'Categoría inhabilitada correctamente',
      categoria: this.mapCategoria(actualizada),
    };
  }

  async listarCursosWebAdmin() {
    const cursos = await this.cursoRepo.find({
      order: {
        orden_web: 'ASC',
        nombrecurso: 'ASC',
      },
    });

    const idsCursos = cursos.map((curso) => curso.id);

    const relaciones =
      idsCursos.length > 0
        ? await this.cursoCategoriaRepo.find({
            where: {
              idcurso: In(idsCursos),
            },
            relations: ['categoria'],
            order: {
              orden: 'ASC',
            },
          })
        : [];

    const categoriasPorCurso = new Map<number, CategoriaCurso[]>();

    relaciones.forEach((relacion) => {
      if (!relacion.categoria) return;

      const lista = categoriasPorCurso.get(relacion.idcurso) || [];
      lista.push(relacion.categoria);
      categoriasPorCurso.set(relacion.idcurso, lista);
    });

    return cursos.map((curso) =>
      this.mapCursoAdmin(curso, categoriasPorCurso.get(curso.id) || []),
    );
  }

  async actualizarCursoWeb(id: number, data: any) {
    const curso = await this.cursoRepo.findOne({
      where: { id },
    });

    if (!curso) {
      throw new NotFoundException('Curso no encontrado');
    }

    if (data?.visible_web !== undefined) {
      curso.visible_web = Boolean(data.visible_web);
    }

    if (data?.destacado_web !== undefined) {
      curso.destacado_web = Boolean(data.destacado_web);
    }

    if (data?.imagen_url !== undefined) {
      curso.imagen_url = data.imagen_url || null;
    }

    if (data?.slug !== undefined) {
      const nuevoSlug = data.slug ? this.normalizarSlug(data.slug) : null;

      if (nuevoSlug) {
        const existeSlug = await this.cursoRepo.findOne({
          where: { slug: nuevoSlug },
        });

        if (existeSlug && existeSlug.id !== curso.id) {
          throw new BadRequestException('Ya existe un curso con ese slug');
        }
      }

      curso.slug = nuevoSlug;
    }

    if (data?.orden_web !== undefined) {
      curso.orden_web = Number(data.orden_web || 1);
    }

    if (data?.etiqueta_web !== undefined) {
      curso.etiqueta_web = data.etiqueta_web || 'Curso';
    }

    if (data?.resumen_web !== undefined) {
      curso.resumen_web = data.resumen_web || null;
    }

    if (data?.requisitos_web !== undefined) {
      curso.requisitos_web = data.requisitos_web || null;
    }

    if (data?.beneficios_web !== undefined) {
      curso.beneficios_web = this.parseBeneficios(data.beneficios_web);
    }

    curso.actualizado_web = new Date();

    const actualizado = await this.cursoRepo.save(curso);

    const relaciones = await this.cursoCategoriaRepo.find({
      where: {
        idcurso: actualizado.id,
      },
      relations: ['categoria'],
      order: {
        orden: 'ASC',
      },
    });

    return this.mapCursoAdmin(
      actualizado,
      relaciones.map((relacion) => relacion.categoria).filter(Boolean),
    );
  }

  async asignarCategoriasCurso(idcurso: number, data: any) {
    const curso = await this.cursoRepo.findOne({
      where: { id: idcurso },
    });

    if (!curso) {
      throw new NotFoundException('Curso no encontrado');
    }

    const categoriasIdsRaw = data?.categoriasIds || data?.categorias || [];

    if (!Array.isArray(categoriasIdsRaw)) {
      throw new BadRequestException('categoriasIds debe ser un arreglo');
    }

    const categoriasIds = [
      ...new Set(
        categoriasIdsRaw
          .map((id) => Number(id))
          .filter((id) => Number.isInteger(id) && id > 0),
      ),
    ];

    await this.cursoCategoriaRepo.delete({ idcurso });

    if (categoriasIds.length === 0) {
      return {
        message: 'Categorías del curso actualizadas',
        curso: this.mapCursoAdmin(curso, []),
      };
    }

    const categorias = await this.categoriaRepo.find({
      where: {
        id: In(categoriasIds),
      },
    });

    if (categorias.length !== categoriasIds.length) {
      throw new BadRequestException('Una o más categorías no existen');
    }

    const nuevasRelaciones = categoriasIds.map((idcategoria, index) =>
      this.cursoCategoriaRepo.create({
        idcurso,
        idcategoria,
        orden: index + 1,
      }),
    );

    await this.cursoCategoriaRepo.save(nuevasRelaciones);

    curso.actualizado_web = new Date();
    await this.cursoRepo.save(curso);

    return {
      message: 'Categorías del curso actualizadas',
      curso: this.mapCursoAdmin(curso, categorias),
    };
  }

  async obtenerContenidoPagina(pagina: string) {
    const registro = await this.webContenidoRepo.findOne({
        where: { pagina },
    });

    if (!registro) {
        return {
        pagina,
        contenido: {},
        estado: true,
        };
    }

    return {
        id: registro.id,
        pagina: registro.pagina,
        contenido: registro.contenido,
        estado: registro.estado,
        updated_at: registro.updated_at,
    };
    }

    async actualizarContenidoPagina(pagina: string, data: any) {
    let registro = await this.webContenidoRepo.findOne({
        where: { pagina },
    });

    if (!registro) {
        registro = this.webContenidoRepo.create({
        pagina,
        contenido: data?.contenido || {},
        estado: true,
        updated_at: new Date(),
        });
    } else {
        registro.contenido = data?.contenido || {};
        registro.estado = data?.estado ?? true;
        registro.updated_at = new Date();
    }

    const guardado = await this.webContenidoRepo.save(registro);

    return {
        id: guardado.id,
        pagina: guardado.pagina,
        contenido: guardado.contenido,
        estado: guardado.estado,
        updated_at: guardado.updated_at,
    };
    }
}