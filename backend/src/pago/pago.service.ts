import { Injectable } from '@nestjs/common';
import { supabase } from '../supabase.client';
import mercadopago from 'mercadopago';
import { MatriculaService } from '../matricula/matricula.service';

@Injectable()
export class PagoService {
  constructor(
  private matriculaService: MatriculaService
) {}
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

async pagarConTarjeta(data: any) {

  mercadopago.configure({
    access_token: process.env.MP_ACCESS_TOKEN
  });

  const payment = await mercadopago.payment.create({
    transaction_amount: 50,
    token: data.token,
    description: 'Curso',
    installments: Number(data.installments),
    payment_method_id: data.payment_method_id,
    issuer_id: data.issuer_id,
    payer: {
      email: data.email
    }
  });

  if (payment.body.status === "approved") {

  console.log("🔥 matricula_id:", data.matricula_id);

  const { error } = await supabase
    .from('matricula')
    .update({ estado: 'pagado' })
    .eq('id', data.matricula_id);

  if (error) {
    throw new Error(error.message);
  }

}

  return payment.body;
}

}
