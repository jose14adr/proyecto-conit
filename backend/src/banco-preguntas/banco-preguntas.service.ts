import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as XLSX from 'xlsx';
import { BancoPregunta } from './entities/banco-pregunta.entity';
import { BancoOpcion } from './entities/banco-opcion.entity';

type FilaExcelNormalizada = {
  orden?: string;
  tipo_pregunta?: string;
  enunciado?: string;
  puntaje?: string;
  opcion_a?: string;
  opcion_b?: string;
  opcion_c?: string;
  opcion_d?: string;
  respuesta_correcta?: string;
  respuesta_referencia?: string;
  categoria?: string;
  dificultad?: string;
};

@Injectable()
export class BancoPreguntasService {
  constructor(
    @InjectRepository(BancoPregunta)
    private readonly bancoPreguntaRepository: Repository<BancoPregunta>,

    @InjectRepository(BancoOpcion)
    private readonly bancoOpcionRepository: Repository<BancoOpcion>,

    private readonly dataSource: DataSource,
  ) {}

  async importarExcel(params: {
    file: Express.Multer.File;
    iddocente: number;
    idcurso: number | null;
  }) {
    const { file, iddocente, idcurso } = params;

    if (!iddocente || Number.isNaN(iddocente)) {
      throw new BadRequestException('El iddocente no es válido.');
    }

    if (idcurso !== null && Number.isNaN(idcurso)) {
      throw new BadRequestException('El idcurso no es válido.');
    }

    const nombreArchivo = file.originalname.toLowerCase();

    if (!nombreArchivo.endsWith('.xlsx') && !nombreArchivo.endsWith('.xls')) {
      throw new BadRequestException('El archivo debe ser Excel: .xlsx o .xls');
    }

    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const primeraHoja = workbook.SheetNames[0];

    if (!primeraHoja) {
      throw new BadRequestException('El Excel no contiene hojas.');
    }

    const worksheet = workbook.Sheets[primeraHoja];

    const filasRaw = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, {
      defval: '',
    });

    if (!filasRaw.length) {
      throw new BadRequestException('El Excel no contiene preguntas.');
    }

    const errores: string[] = [];

    const preguntasProcesadas: Array<{
      pregunta: Partial<BancoPregunta>;
      opciones: Array<Partial<BancoOpcion>>;
    }> = [];

    filasRaw.forEach((filaRaw, index) => {
      const numeroFila = index + 2;
      const fila = this.normalizarFila(filaRaw);

      const tipoPregunta = this.normalizarTipoPregunta(fila.tipo_pregunta || '');
      const enunciado = String(fila.enunciado || '').trim();
      const puntaje = this.convertirNumero(fila.puntaje || '1');

      if (!tipoPregunta) {
        errores.push(`Fila ${numeroFila}: tipo_pregunta inválido o vacío.`);
        return;
      }

      if (!enunciado) {
        errores.push(`Fila ${numeroFila}: el enunciado es obligatorio.`);
        return;
      }

      if (puntaje === null || puntaje <= 0) {
        errores.push(`Fila ${numeroFila}: el puntaje debe ser mayor a 0.`);
        return;
      }

      const respuestaCorrecta = String(
        fila.respuesta_correcta || fila.respuesta_referencia || '',
      ).trim();

      const pregunta: Partial<BancoPregunta> = {
        iddocente,
        idcurso,
        tipo_pregunta: tipoPregunta,
        enunciado,
        puntaje,
        respuesta_referencia: null,
        categoria: fila.categoria ? String(fila.categoria).trim() : null,
        dificultad: fila.dificultad ? String(fila.dificultad).trim() : null,
        estado: true,
      };

      const opciones: Array<Partial<BancoOpcion>> = [];

      if (tipoPregunta === 'unica' || tipoPregunta === 'multiple') {
        const opcionesExcel = [
          { letra: 'A', texto: String(fila.opcion_a || '').trim(), orden: 1 },
          { letra: 'B', texto: String(fila.opcion_b || '').trim(), orden: 2 },
          { letra: 'C', texto: String(fila.opcion_c || '').trim(), orden: 3 },
          { letra: 'D', texto: String(fila.opcion_d || '').trim(), orden: 4 },
        ].filter((opcion) => opcion.texto);

        if (opcionesExcel.length < 2) {
          errores.push(
            `Fila ${numeroFila}: las preguntas de opción deben tener al menos 2 opciones.`,
          );
          return;
        }

        if (!respuestaCorrecta) {
          errores.push(
            `Fila ${numeroFila}: debe indicar respuesta_correcta. Ejemplo: A o A,B,D.`,
          );
          return;
        }

        const respuestas = respuestaCorrecta
          .split(',')
          .map((r) => r.trim().toUpperCase())
          .filter(Boolean);

        const letrasDisponibles = opcionesExcel.map((opcion) => opcion.letra);

        const respuestasInvalidas = respuestas.filter(
          (respuesta) => !letrasDisponibles.includes(respuesta),
        );

        if (respuestasInvalidas.length) {
          errores.push(
            `Fila ${numeroFila}: respuesta_correcta contiene opciones inválidas: ${respuestasInvalidas.join(
              ', ',
            )}.`,
          );
          return;
        }

        if (tipoPregunta === 'unica' && respuestas.length !== 1) {
          errores.push(
            `Fila ${numeroFila}: una pregunta de tipo "unica" solo puede tener una respuesta correcta.`,
          );
          return;
        }

        opcionesExcel.forEach((opcion) => {
          opciones.push({
            texto_opcion: opcion.texto,
            es_correcta: respuestas.includes(opcion.letra),
            orden: opcion.orden,
          });
        });
      } else {
        pregunta.respuesta_referencia = respuestaCorrecta || null;

        if (tipoPregunta === 'numerica' && respuestaCorrecta) {
          const numeroRespuesta = this.convertirNumero(respuestaCorrecta);

          if (numeroRespuesta === null) {
            errores.push(
              `Fila ${numeroFila}: la respuesta de una pregunta numérica debe ser un número.`,
            );
            return;
          }
        }
      }

      preguntasProcesadas.push({
        pregunta,
        opciones,
      });
    });

    if (errores.length) {
      throw new BadRequestException({
        message: 'El Excel tiene errores. Corrige las filas indicadas.',
        errores,
      });
    }

    const resultado = await this.dataSource.transaction(async (manager) => {
      let totalPreguntas = 0;
      let totalOpciones = 0;

      for (const item of preguntasProcesadas) {
        const preguntaCreada = manager.create(BancoPregunta, item.pregunta);
        const preguntaGuardada = await manager.save(
          BancoPregunta,
          preguntaCreada,
        );

        totalPreguntas++;

        if (item.opciones.length) {
          const opciones = item.opciones.map((opcion) =>
            manager.create(BancoOpcion, {
              ...opcion,
              idpregunta: preguntaGuardada.id,
            }),
          );

          await manager.save(BancoOpcion, opciones);
          totalOpciones += opciones.length;
        }
      }

      return {
        totalPreguntas,
        totalOpciones,
      };
    });

    return {
      message: 'Preguntas importadas correctamente al banco.',
      iddocente,
      idcurso,
      total_preguntas: resultado.totalPreguntas,
      total_opciones: resultado.totalOpciones,
    };
  }

  async listarPorDocente(iddocente: number) {
    return this.bancoPreguntaRepository.find({
      where: {
        iddocente,
        estado: true,
      },
      relations: ['opciones'],
      order: {
        id: 'DESC',
      },
    });
  }

  async listarPorDocenteYCurso(iddocente: number, idcurso: number) {
    return this.bancoPreguntaRepository.find({
      where: {
        iddocente,
        idcurso,
        estado: true,
      },
      relations: ['opciones'],
      order: {
        id: 'DESC',
      },
    });
  }

  async agregarPreguntasAExamen(params: {
    idexamen: number;
    preguntasIds: number[];
  }) {
    const { idexamen, preguntasIds } = params;

    if (!idexamen || Number.isNaN(idexamen)) {
      throw new BadRequestException('El idexamen no es válido.');
    }

    if (!Array.isArray(preguntasIds) || preguntasIds.length === 0) {
      throw new BadRequestException('Debe enviar al menos una pregunta del banco.');
    }

    const preguntasIdsLimpias = preguntasIds
      .map((id) => Number(id))
      .filter((id) => !Number.isNaN(id));

    if (preguntasIdsLimpias.length === 0) {
      throw new BadRequestException('Los IDs de preguntas no son válidos.');
    }

    const resultado = await this.dataSource.transaction(async (manager) => {
      const examenExiste = await manager.query(
        `
        select id
        from examen
        where id = $1
        limit 1
        `,
        [idexamen],
      );

      if (!examenExiste.length) {
        throw new BadRequestException('El examen indicado no existe.');
      }

      const preguntasBanco = await manager.query(
        `
        select
          id,
          tipo_pregunta,
          enunciado,
          puntaje,
          respuesta_referencia,
          categoria,
          dificultad
        from banco_pregunta
        where id = any($1::bigint[])
          and estado = true
        order by id asc
        `,
        [preguntasIdsLimpias],
      );

      if (!preguntasBanco.length) {
        throw new BadRequestException(
          'No se encontraron preguntas activas en el banco.',
        );
      }

      const ordenActualResult = await manager.query(
        `
        select coalesce(max(orden), 0) as max_orden
        from examen_pregunta
        where idexamen = $1
        `,
        [idexamen],
      );

      let siguienteOrden = Number(ordenActualResult?.[0]?.max_orden || 0) + 1;

      let totalPreguntasCopiadas = 0;
      let totalOpcionesCopiadas = 0;

      for (const preguntaBanco of preguntasBanco) {
        const preguntaInsertada = await manager.query(
          `
          insert into examen_pregunta (
            idexamen,
            tipo_pregunta,
            enunciado,
            puntaje,
            orden,
            estado,
            respuesta_texto
          )
          values ($1, $2, $3, $4, $5, true, $6)
          returning id
          `,
          [
            idexamen,
            preguntaBanco.tipo_pregunta,
            preguntaBanco.enunciado,
            preguntaBanco.puntaje,
            siguienteOrden,
            preguntaBanco.respuesta_referencia || null,
          ],
        );

        const idPreguntaExamen = preguntaInsertada[0].id;

        totalPreguntasCopiadas++;
        siguienteOrden++;

        const opcionesBanco = await manager.query(
          `
          select
            texto_opcion,
            es_correcta,
            orden
          from banco_opcion
          where idpregunta = $1
          order by orden asc
          `,
          [preguntaBanco.id],
        );

        for (const opcionBanco of opcionesBanco) {
          await manager.query(
            `
            insert into examen_opcion (
              idpregunta,
              texto,
              es_correcta,
              orden
            )
            values ($1, $2, $3, $4)
            `,
            [
              idPreguntaExamen,
              opcionBanco.texto_opcion,
              opcionBanco.es_correcta,
              opcionBanco.orden,
            ],
          );

          totalOpcionesCopiadas++;
        }
      }

      return {
        totalPreguntasCopiadas,
        totalOpcionesCopiadas,
      };
    });

    return {
      message: 'Preguntas agregadas correctamente al examen.',
      idexamen,
      total_preguntas: resultado.totalPreguntasCopiadas,
      total_opciones: resultado.totalOpcionesCopiadas,
    };
  }

  private normalizarFila(filaRaw: Record<string, any>): FilaExcelNormalizada {
    const filaNormalizada: Record<string, any> = {};

    Object.entries(filaRaw).forEach(([key, value]) => {
      const claveLimpia = this.normalizarClave(key);
      filaNormalizada[claveLimpia] = value;
    });

    return filaNormalizada;
  }

  private normalizarClave(clave: string): string {
    return String(clave)
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '_')
      .replace(/-/g, '_');
  }

  private normalizarTipoPregunta(tipo: string): string | null {
    const valor = String(tipo)
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '_');

    const mapa: Record<string, string> = {
      unica: 'unica',
      opcion_unica: 'unica',
      seleccion_unica: 'unica',

      multiple: 'multiple',
      opcion_multiple: 'multiple',
      seleccion_multiple: 'multiple',

      texto: 'texto_corto',
      texto_corto: 'texto_corto',
      respuesta_corta: 'texto_corto',

      texto_largo: 'texto_largo',
      respuesta_larga: 'texto_largo',

      numerica: 'numerica',
      numero: 'numerica',
      respuesta_numerica: 'numerica',

      archivo: 'archivo',
      adjunto: 'archivo',
    };

    return mapa[valor] || null;
  }

  private convertirNumero(valor: string | number): number | null {
    if (valor === null || valor === undefined || valor === '') {
      return null;
    }

    const numero = Number(String(valor).replace(',', '.'));

    if (Number.isNaN(numero)) {
      return null;
    }

    return numero;
  }
}