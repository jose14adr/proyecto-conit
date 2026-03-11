import { Injectable } from '@nestjs/common';
import { supabase } from '../supabase.client';

@Injectable()
export class PagoService {
  async getPagosPendientes() {
    const { data, error } = await supabase
      .from('matricula')
      .select(`
        id,
        observacion,
        estado,
        idalumno,
        grupo (
          idcurso,
          curso (
            precio,
            nombrecurso
          )
        )
      `)
      .eq('estado', 'pendiente')
      .eq('idalumno', 1); // por ahora alumno de prueba

    if (error) {
      throw new Error(error.message);
    }

    return (data || []).map((m:any) => ({
      id: m.id,
      descripcion: m.observacion || 'Matrícula pendiente',
      curso: m.grupo?.curso?.nombrecurso || 'Curso no especificado',
      monto: m.grupo?.curso?.precio || 0,
      estado: m.estado,
      idalumno: m.idalumno,
    }));
  }

  async realizarPago(id: number) {
  const { data, error } = await supabase
    .from('matricula')
    .update({ estado: 'pagado' })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    message: 'Pago realizado correctamente',
    data,
  };
}

async getPagosRealizados() {
  const { data, error } = await supabase
    .from('matricula')
    .select(`
      id,
      observacion,
      estado,
      idalumno,
      grupo (
        idcurso,
        curso (
          precio,
          nombrecurso
        )
      )
    `)
    .eq('estado', 'pendiente')
    .eq('idalumno', 1);

  if (error) {
    throw new Error(error.message);
  }

  return (data || []).map((m: any) => ({
    id: m.id,
    fecha: new Date().toLocaleDateString(),
    descripcion: m.observacion || 'Matrícula pagada',
    curso: m.grupo?.curso?.nombrecurso || 'Curso no especificado',
    monto: m.grupo?.curso?.precio || 0,
    codigo: `BOL-${m.id}`,
    estado: m.estado,
    idalumno: m.idalumno,
  }));
}

}
