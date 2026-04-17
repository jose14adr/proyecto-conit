    import { Injectable } from '@nestjs/common';
    import { supabase } from '../supabase.client';

    @Injectable()
    export class ExamenService {
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
        
        // Agregar log para verificar los ids de los exámenes
        console.log("IDs de los exámenes:", examenIds);



        // Asegurarse de que las preguntas estén asociadas a los exámenes
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

        // Obtener las opciones asociadas a cada pregunta
        const preguntasConOpciones = await Promise.all(preguntas.map(async (pregunta) => {
            const { data: opciones, error: errOpciones } = await supabase
            .from('examen_opcion')
            .select('*')
            .eq('idpregunta', pregunta.id);

            if (errOpciones) throw new Error(errOpciones.message);

            return {
            ...pregunta,
            opciones,  // Añadimos las opciones a la pregunta
            };
        }));

        return preguntasConOpciones;
        }
    // 🔹 Guardar respuestas del examen y calcular la nota
    async responder(examenId: number, respuestas: Record<string, number>) {
        const idExamen = Number(examenId);

        // Obtener examen y preguntas
        const { data: examen, error: errExamen } = await supabase
        .from('examen')
        .select('*')
        .eq('id', idExamen)
        .single();

        if (errExamen) throw new Error(errExamen.message);
        if (!examen) throw new Error('Examen no encontrado.');

        const { data: preguntas, error: errPreguntas } = await supabase
        .from('examen_pregunta')
        .select('*')
        .eq('idexamen', idExamen)
        .eq('estado', true)
        .order('orden', { ascending: true });

        if (errPreguntas) throw new Error(errPreguntas.message);

        const listaPreguntas = preguntas || [];
        if (listaPreguntas.length === 0) throw new Error('El examen no tiene preguntas.');

        const preguntaIds = listaPreguntas.map((p) => Number(p.id));

        // Obtener las opciones correctas
        const { data: opciones, error: errOpciones } = await supabase
        .from('examen_opcion')
        .select('*')
        .in('idpregunta', preguntaIds);

        if (errOpciones) throw new Error(errOpciones.message);
        const listaOpciones = opciones || [];

        // Verificar respuestas
        let puntajeTotal = 0;
        let puntajeObtenido = 0;

        for (const pregunta of listaPreguntas) {
        const idPregunta = Number(pregunta.id);
        const puntajePregunta = Number(pregunta.puntaje || 1);
        puntajeTotal += puntajePregunta;

        const opcionCorrecta = listaOpciones.find(
            (o) => Number(o.idpregunta) === idPregunta && o.es_correcta === true,
        );

        const respuestaAlumno = respuestas[idPregunta];

        if (
            opcionCorrecta &&
            Number(respuestaAlumno) === Number(opcionCorrecta.id)
        ) {
            puntajeObtenido += puntajePregunta;
        }
        }

        const notaMaxima = Number(examen.nota_maxima || 20);
        const notaFinal =
        puntajeTotal > 0
            ? Number(((puntajeObtenido / puntajeTotal) * notaMaxima).toFixed(2))
            : 0;

        // Guardar intento en examen_intento
        const { error: errorIntento } = await supabase
            .from('examen_intento')
            .insert({
                examen_id: idExamen,
                alumno_id: 1,  // Aquí debe ir el ID del alumno logueado
                puntaje_total: puntajeTotal,
                puntaje_obtenido: puntajeObtenido,
                nota: notaFinal,    
            });

            if (errorIntento) throw new Error(errorIntento.message);

        // Guardar respuestas en examen_respuesta
        const respuestasAInsertar = Object.keys(respuestas).map((preguntaId) => ({
        examen_id: idExamen,
        pregunta_id: Number(preguntaId),
        respuesta_id: respuestas[preguntaId],
        }));

        const { error: errorRespuestas } = await supabase
            .from('examen_respuesta')
            .insert(respuestasAInsertar);

            if (errorRespuestas) throw new Error(errorRespuestas.message);

            return {
            examenId: idExamen,
            puntajeTotal,
            puntajeObtenido,
            nota: notaFinal,
            mensaje: 'Examen enviado correctamente',
            };
    }

    async iniciar(examenId: number, idAlumno: number) {
  const { data: examen } = await supabase
    .from('examen')
    .select('*')
    .eq('id', examenId)
    .single();

  const { data: intentos } = await supabase
  .from('examen_intento')
  .select('*')
  .eq('examen_id', examenId)
  .eq('alumno_id', idAlumno);

// Asegurarse de que intentos sea siempre un array
const listaIntentos = intentos || [];

if (listaIntentos.length >= examen.intentos_permitidos) {
  throw new Error("Ya no tienes intentos disponibles");
}

  return { ok: true };
}
    }