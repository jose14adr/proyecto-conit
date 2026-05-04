import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Curso } from '../curso/entities/curso.entity';
import { CategoriaCurso } from '../categoria-curso/categoria-curso.entity';
import { CursoCategoriaWeb } from '../categoria-curso/curso-categoria-web.entity';
import { WebContenido } from './entities/web-contenido.entity';
import { MensajeContacto } from './entities/mensaje-contacto.entity';
import { WebPagina } from './entities/web-pagina.entity';

@Injectable()
export class WebService {
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

    @InjectRepository(WebPagina)
    private readonly webPaginaRepo: Repository<WebPagina>,
  ) {}

  private mapCursoWeb(curso: Curso) {
    const precioBase = Number(curso.precio_final ?? curso.precio ?? 0);

    return {
      id: curso.id,
      titulo: curso.nombrecurso,
      descripcion: curso.resumen_web || curso.descripcion,
      descripcionCompleta: curso.descripcion,
      nivel: curso.nivel,
      estado: curso.estado,
      duracion: curso.duracion ?? 0,
      tiempoSemana: curso.tiemposemana,
      creditos: curso.creditos ?? 0,
      precio: precioBase,
      descuento: Number(curso.descuento ?? 0),
      precioFinal: precioBase,
      publicoObjetivo: curso.publicoobjetivo,
      contenidoMultimedia: curso.contenidomultimedia,
      imagenUrl: curso.imagen_url,
      slug: curso.slug,
      etiqueta: curso.etiqueta_web || 'Curso',
      destacado: curso.destacado_web,
      requisitos: curso.requisitos_web,
      beneficios: curso.beneficios_web || [],
      orden: curso.orden_web ?? 1,
    };
  }

  private mapPaginaWeb(pagina: WebPagina) {
    return {
      id: pagina.id,
      titulo: pagina.titulo,
      slug: pagina.slug,
      ruta: pagina.ruta,
      tipo: pagina.tipo,
      descripcion: pagina.descripcion,
      visibleMenu: pagina.visible_menu,
      publicada: pagina.publicada,
      protegida: pagina.protegida,
      orden: pagina.orden,
      seoTitle: pagina.seo_title,
      seoDescription: pagina.seo_description,
      contenido: pagina.contenido || { secciones: [] },
      createdAt: pagina.created_at,
      updatedAt: pagina.updated_at,
    };
  }

  async listarPaginasMenu() {
    const paginas = await this.webPaginaRepo.find({
      where: {
        visible_menu: true,
        publicada: true,
      },
      order: {
        orden: 'ASC',
        titulo: 'ASC',
      },
    });

    return paginas.map((pagina) => ({
      id: pagina.id,
      titulo: pagina.titulo,
      slug: pagina.slug,
      ruta: pagina.ruta,
      tipo: pagina.tipo,
      orden: pagina.orden,
    }));
  }

  async obtenerPaginaPorSlug(slug: string) {
    const pagina = await this.webPaginaRepo.findOne({
      where: {
        slug,
        publicada: true,
      },
    });

    if (!pagina) {
      throw new NotFoundException('Página no encontrada');
    }

    return this.mapPaginaWeb(pagina);
  }

  async listarCategoriasWeb() {
    const categorias = await this.categoriaRepo.find({
      where: {
        visible_web: true,
        estado: true,
      },
      order: {
        orden: 'ASC',
        nombre: 'ASC',
      },
    });

    return categorias.map((categoria) => ({
      id: categoria.id,
      nombre: categoria.nombre,
      slug: categoria.slug,
      descripcion: categoria.descripcion,
      imagenUrl: categoria.imagen_url,
      orden: categoria.orden,
    }));
  }

  async listarCursosWeb() {
    const cursos = await this.cursoRepo.find({
      where: {
        visible_web: true,
        estado: true,
      },
      order: {
        orden_web: 'ASC',
        nombrecurso: 'ASC',
      },
    });

    return cursos.map((curso) => this.mapCursoWeb(curso));
  }

  async obtenerCursoWeb(idOrSlug: string) {
    const esId = /^\d+$/.test(idOrSlug);

    const curso = await this.cursoRepo.findOne({
      where: esId
        ? {
            id: Number(idOrSlug),
            visible_web: true,
            estado: true,
          }
        : {
            slug: idOrSlug,
            visible_web: true,
            estado: true,
          },
    });

    if (!curso) {
      throw new NotFoundException('Curso no encontrado o no disponible');
    }

    return this.mapCursoWeb(curso);
  }

  async registrarMensajeContacto(data: any) {
    const nombre = String(data?.nombre || '').trim();
    const correo = String(data?.correo || '').trim().toLowerCase();
    const asunto = String(data?.asunto || '').trim();
    const mensaje = String(data?.mensaje || '').trim();

    if (!nombre) {
      throw new BadRequestException('El nombre es obligatorio');
    }

    if (!correo) {
      throw new BadRequestException('El correo es obligatorio');
    }

    const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);

    if (!correoValido) {
      throw new BadRequestException('Ingresa un correo válido');
    }

    if (!asunto) {
      throw new BadRequestException('El asunto es obligatorio');
    }

    if (!mensaje) {
      throw new BadRequestException('El mensaje es obligatorio');
    }

    const nuevoMensaje = this.mensajeContactoRepo.create({
      nombre,
      correo,
      asunto,
      mensaje,
      estado: 'PENDIENTE',
      leido: false,
      updated_at: new Date(),
    });

    const guardado = await this.mensajeContactoRepo.save(nuevoMensaje);

    return {
      message: 'Mensaje enviado correctamente',
      id: guardado.id,
    };
  }

  async listarCursosPorCategoria(slug: string) {
    const categoria = await this.categoriaRepo.findOne({
      where: {
        slug,
        visible_web: true,
        estado: true,
      },
    });

    if (!categoria) {
      throw new NotFoundException('Categoría no encontrada');
    }

    const relaciones = await this.cursoCategoriaRepo.find({
      where: {
        idcategoria: categoria.id,
      },
      relations: ['curso'],
      order: {
        orden: 'ASC',
      },
    });

    const cursos = relaciones
      .map((relacion) => relacion.curso)
      .filter((curso) => curso?.visible_web === true && curso?.estado === true)
      .sort((a, b) => (a.orden_web ?? 1) - (b.orden_web ?? 1))
      .map((curso) => this.mapCursoWeb(curso));

    return {
      categoria: {
        id: categoria.id,
        nombre: categoria.nombre,
        slug: categoria.slug,
        descripcion: categoria.descripcion,
        imagenUrl: categoria.imagen_url,
      },
      cursos,
    };
  }

  async listarCursosDestacadosWeb() {
    const cursos = await this.cursoRepo.find({
        where: {
        visible_web: true,
        estado: true,
        destacado_web: true,
        },
        order: {
        orden_web: 'ASC',
        nombrecurso: 'ASC',
        },
        take: 3,
    });

    return cursos.map((curso) => this.mapCursoWeb(curso));
    }

    async obtenerContenidoPagina(pagina: string) {
        const registro = await this.webContenidoRepo.findOne({
            where: {
            pagina,
            estado: true,
            },
        });

        if (!registro) {
            return null;
        }

        return registro.contenido;
        }
}