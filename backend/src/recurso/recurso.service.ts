import { Injectable } from '@nestjs/common';
import { supabase } from '../supabase.client';

@Injectable()
export class RecursoService {

  async obtenerRecursos() {

    const { data, error } = await supabase
      .from("recurso")
      .select("*");

    if (error) throw error;

    return data;

  }

  async incrementarClicks(id: number) {

    const { data: recurso } = await supabase
      .from("recurso")
      .select("descargas")
      .eq("id", id)
      .single();

    if (!recurso) {
      throw new Error("Recurso no encontrado");
    }

    const { data, error } = await supabase
      .from("recurso")
      .update({
        descargas: recurso.descargas + 1
      })
      .eq("id", id)
      .select();

    if (error) throw error;

    return data?.[0];

  }

}