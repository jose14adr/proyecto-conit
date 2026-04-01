import { Injectable } from '@nestjs/common';
import { supabase } from '../supabase.client';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MultimediaService {
  async upload(file: Express.Multer.File, usuario_id: string) {
    const fileName = `${uuidv4()}-${file.originalname}`;

    // 1. Subir imagen al bucket
    const { error: storageError } = await supabase.storage
      .from('imagenes')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
      });

    if (storageError) {
      throw new Error(storageError.message);
    }

    // 2. Obtener URL pública
    const { data } = supabase.storage
      .from('imagenes')
      .getPublicUrl(fileName);

    const publicUrl = data.publicUrl;

    // 3. Buscar alumno por idusuario
    const { data: alumno, error: alumnoError } = await supabase
      .from('alumno')
      .select('id, idusuario')
      .eq('idusuario', Number(usuario_id))
      .single();

    if (alumnoError || !alumno) {
      throw new Error('No se encontró el alumno asociado al usuario');
    }

    // 4. Actualizar foto_url del alumno
    const { error: updateError } = await supabase
      .from('alumno')
      .update({
        foto_url: publicUrl,
      })
      .eq('id', alumno.id);

    if (updateError) {
      throw new Error(updateError.message);
    }

    return {
      message: 'Imagen subida correctamente',
      url: publicUrl,
    };
  }
}