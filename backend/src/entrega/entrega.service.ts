import { Injectable } from '@nestjs/common';
import { supabase } from '../supabase.client';

@Injectable()
export class EntregaService {

  async crearEntrega(data) {

    const { data: entrega, error } = await supabase
      .from('entrega')
      .insert(data)
      .select()
      .single()

    if (error) throw error

    return entrega
  }

  async obtenerEntregasAlumno(idusuario) {

    const { data, error } = await supabase
      .from('entrega')
      .select(`
        *,
        tarea(*)
      `)
      .eq('idusuario', idusuario)

    if (error) throw error

    return data
  }

}
