import { Injectable } from '@nestjs/common';
import { supabase } from '../supabase.client';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExamenIntento } from '../examen_intento/entities/examen_intento.entity';
import { Examen } from './entities/examen.entity';
import { Matricula } from 'src/matricula/entities/matricula.entity';

@Injectable()
export class ExamenService {
    constructor(
    @InjectRepository(ExamenIntento)
    private intentoRepository: Repository<ExamenIntento>,

    @InjectRepository(Matricula)
    private matriculaRepository: Repository<Matricula>,

    @InjectRepository(Examen)
    private examenRepository: Repository<Examen>,
  ) {}

  // 🔹 Obtener exámenes por curso
  async getByCurso(grupoId: number) {
    const { data: examenes, error: errExamenes } = await supabase
      .from('examen')
      .select('*')
      .eq('idgrupo', grupoId)
      .eq('estado', true)
      .order('created_at', { ascending: true });

    if (errExamenes) throw new Error(errExamenes.message);

    const examenIds = examenes.map((e) => e.id);
    const preguntas = await this.getPreguntasDeExamenes(examenIds);

    return examenes.map((examen) => ({
      ...examen,
      preguntas: preguntas.filter((preg) => preg.idexamen === examen.id),
    }));
  }

  async getPreguntasDeExamenes(examenIds: number[]) {
    const { data: preguntas, error: errPreguntas } = await supabase
      .from('examen_pregunta')
      .select('*')
      .in('idexamen', examenIds);

    if (errPreguntas) throw new Error(errPreguntas.message);

    const preguntasConOpciones = await Promise.all(
      preguntas.map(async (pregunta) => {
        const { data: opciones, error: errOpciones } = await supabase
          .from('examen_opcion')
          .select('*')
          .eq('idpregunta', pregunta.id);

        if (errOpciones) throw new Error(errOpciones.message);

        return {
          ...pregunta,
          opciones,
        };
      })
    );

    return preguntasConOpciones;
  }

  // 🔥 RESPONDER EXAMEN (PRO)
  async responder(intentoId: number, respuestas: Record<string, number | string>) {

    // 🔹 obtener intento
    const { data: intento, error: errIntento } = await supabase
      .from('examen_intento')
      .select('*')
      .eq('id', intentoId)
      .single();

    if (errIntento) throw new Error(errIntento.message);
    if (!intento) throw new Error("Intento no encontrado");

    if (intento.finalizado) {
      throw new Error("⚠️ Este intento ya fue finalizado");
    }

    const idExamen = intento.idexamen;

    // 🔹 obtener preguntas
    const { data: preguntas, error: errPreguntas } = await supabase
      .from('examen_pregunta')
      .select('*')
      .eq('idexamen', idExamen)
      .eq('estado', true);

    if (errPreguntas) throw new Error(errPreguntas.message);

    if (!preguntas || preguntas.length === 0) {
      throw new Error("El examen no tiene preguntas");
    }

    const preguntaIds = preguntas.map(p => p.id);

    // 🔹 obtener opciones
    const { data: opciones, error: errOpciones } = await supabase
      .from('examen_opcion')
      .select('*')
      .in('idpregunta', preguntaIds);

    if (errOpciones) throw new Error(errOpciones.message);

    let puntajeTotal = 0;
    let puntajeObtenido = 0;

    // 🔥 limpiar respuestas previas (por seguridad)
    await supabase
      .from('examen_respuesta')
      .delete()
      .eq('idintento', intentoId);

    const respuestasAInsertar = preguntas.map(p => {
    const respuestaAlumno = respuestas[p.id];

    let esCorrecta = false;
    let puntaje = 0;

    // 🔥 PREGUNTA DE TEXTO
    if (p.tipo_prgunta === 'texto') {
      return {
        idintento: intentoId,
        idpregunta: p.id,
        idopcion: null,
        respuesta_texto: respuestaAlumno || null,
        es_correcta: null,
        puntaje_obtenido: 0
      };
    }

    // 🔥 PREGUNTA DE ALTERNATIVA
    const correcta = opciones.find(
      o => o.idpregunta === p.id && o.es_correcta
    );

    esCorrecta = correcta && respuestaAlumno == correcta.id;

    puntaje = esCorrecta ? Number(p.puntaje || 1) : 0;

    puntajeTotal += Number(p.puntaje || 1);
    puntajeObtenido += puntaje;

    return {
      idintento: intentoId,
      idpregunta: p.id,
      idopcion: respuestaAlumno || null,
      respuesta_texto: null,
      es_correcta: esCorrecta || false,
      puntaje_obtenido: puntaje
    };
  });

    await supabase.from('examen_respuesta').insert(respuestasAInsertar);

    const notaFinal =
  puntajeTotal > 0
    ? Number(((puntajeObtenido / puntajeTotal) * 20).toFixed(2))
    : 0;

// 🔥 DEBUG
console.log("INTENTO ID:", intentoId);
console.log("NOTA FINAL:", notaFinal);

// 🔥 ACTUALIZAR INTENTO
const { data: updateData, error: updateError } = await supabase
  .from('examen_intento')
  .update({
    nota: notaFinal,
    finalizado: true,
    fecha_fin: new Date()
  })
  .eq('id', intentoId)
  .select();

if (updateError) {
  console.error("ERROR UPDATE:", updateError);
  throw new Error(updateError.message);
}

console.log("UPDATE OK:", updateData);

    return {
      nota: notaFinal,
      puntajeTotal,
      puntajeObtenido,
      totalPreguntas: preguntas.length
    };
  }

  // 🔥 INICIAR EXAMEN (PRO)
  async iniciar(examenId: number, idAlumno: number) {
    const examen = await this.examenRepository.findOne({
        where: { id: examenId },
        relations: ['grupo'],
    });

    if (!examen) {
        throw new Error('Examen no encontrado');
    }

    // 🔥 BUSCAR MATRÍCULA CORRECTA
    const matricula = await this.matriculaRepository.findOne({
        where: {
        alumno: { id: idAlumno },
        grupo: { id: examen.grupo.id },
        },
    });

    if (!matricula) {
        throw new Error('El alumno no está matriculado en este grupo');
    }

    // 🔥 CONTAR INTENTOS
    const intentos = await this.intentoRepository.count({
        where: {
        examen: { id: examenId },
        alumno: { id: idAlumno },
        },
    });

    console.log('Intentos:', intentos);
    console.log('Permitidos:', examen.intentos_permitidos);

    if (intentos >= examen.intentos_permitidos) {
        throw new Error('Ya no tienes intentos disponibles');
    }

    // 🔥 CREAR INTENTO (SIN NULL)
    const intento = this.intentoRepository.create({
        examen: { id: examenId } as any,
        alumno: { id: idAlumno } as any,
        matricula: { id: matricula.id } as any,
        intento_numero: intentos + 1,
    });

    return this.intentoRepository.save(intento);
  }

    async getIntentosAlumno(idAlumno: number) {
    const { data, error } = await supabase
        .from('examen_intento')
        .select(`
        id,
        idexamen,
        nota,
        finalizado
        `)
        .eq('idalumno', idAlumno)
        .eq('finalizado', true);

    if (error) throw new Error(error.message);

    return data;
    }

  async getHistorial(idAlumno: number) {

    const { data, error } = await supabase
      .from('examen_intento')
      .select(`
        id,
        idexamen,
        nota,
        examen:idexamen (
          id,
          titulo,
          grupo:idgrupo (
            id,
            nombregrupo,
            horario,
            modalidad,
            curso:idcurso (
              id,
              nombrecurso
            )
          )
        )
      `)
      .eq('idalumno', idAlumno)
      .eq('finalizado', true);

    if (error) throw new Error(error.message);

    if (!data || data.length === 0) {
      return [];
    }

    const cursosMap: any = {};

    data.forEach((item) => {

      const examenRaw = item.examen;

      const examen = Array.isArray(examenRaw)
        ? examenRaw[0]
        : examenRaw;

      if (!examen) return;

      // 🔥 GRUPO
      const grupoRaw = examen.grupo;
      const grupo = Array.isArray(grupoRaw)
        ? grupoRaw[0]
        : grupoRaw;

      if (!grupo) return;

      // 🔥 CURSO
      const cursoRaw = grupo.curso;
      const curso = Array.isArray(cursoRaw)
        ? cursoRaw[0]
        : cursoRaw;

      const cursoId = grupo.id;
      const nombreCurso = curso?.nombrecurso || "Curso sin nombre";
      const nombreGrupo = grupo?.nombregrupo || "Grupo sin nombre";
      const horario = grupo?.horario || "Grupo sin horario";
      const modalidad = grupo?.modalidad || "Grupo sin modalidad";

      if (!cursosMap[cursoId]) {
        cursosMap[cursoId] = {
          cursoId,
          nombreCurso,
          nombreGrupo,
          horario,
          modalidad,
          examenes: []
        };
      }

      cursosMap[cursoId].examenes.push({
        id: examen.id,
        titulo: examen.titulo,
        nota: item.nota
      });

    });

    return Object.values(cursosMap);
  }

  async getExamenCompleto(examenId: number) {
    // 🔹 EXAMEN
    const { data: examen, error: errExamen } = await supabase
      .from('examen')
      .select('*')
      .eq('id', examenId)
      .single();

    if (errExamen) throw new Error(errExamen.message);

    // 🔹 PREGUNTAS
    const { data: preguntas, error: errPreguntas } = await supabase
      .from('examen_pregunta')
      .select('*')
      .eq('idexamen', examenId);

    if (errPreguntas) throw new Error(errPreguntas.message);

    const preguntasSafe = preguntas || [];

    // 🔹 OPCIONES POR PREGUNTA
    const preguntasConOpciones = await Promise.all(
      preguntasSafe.map(async (p) => {
        const { data: opciones, error: errOpciones } = await supabase
          .from('examen_opcion')
          .select('*')
          .eq('idpregunta', p.id);

        if (errOpciones) throw new Error(errOpciones.message);

        return {
          ...p,
          opciones: opciones || [],
        };
      })
    );

    return {
      ...examen,
      preguntas: preguntasConOpciones,
    };
  }
}
