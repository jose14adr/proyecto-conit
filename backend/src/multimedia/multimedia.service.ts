import { Injectable } from '@nestjs/common';
import { supabase } from '../supabase.client';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MultimediaService {
  async upload(file: Express.Multer.File, user: any) {

    if (!file) {
      throw new Error('No se recibió ningún archivo');
    }

    console.log("USER 👉", user);

    const fileName = `${uuidv4()}-${file.originalname}`;

    const { error: storageError } = await supabase.storage
      .from('imagenes')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
      });

    if (storageError) {
      throw new Error(storageError.message);
    }

    const { data } = supabase.storage
      .from('imagenes')
      .getPublicUrl(fileName);

    const publicUrl = data.publicUrl;

    // 🔥 CORRECCIÓN AQUÍ
    const { data: alumno, error: alumnoError } = await supabase
      .from('alumno')
      .select('id, idusuario')
      .eq('idusuario', user.userId) // 👈 ESTE ES EL CAMBIO
      .single();

    console.log("ALUMNO 👉", alumno);

    if (alumnoError || !alumno) {
      throw new Error('No se encontró el alumno asociado al usuario');
    }

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