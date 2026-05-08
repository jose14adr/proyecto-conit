import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfiguracionPago } from './entities/configuracion-pago.entity';

@Injectable()
export class ConfiguracionPagoService {
  constructor(
    @InjectRepository(ConfiguracionPago)
    private configRepo: Repository<ConfiguracionPago>,
  ) {}

  // 1. Obtener configuración de una pasarela única (MP, Yape, Izipay)
  async obtenerConfiguracion(pasarela: string) {
    return await this.configRepo.findOne({ where: { pasarela } });
  }

  // 2. Guardar o actualizar pasarela única
  async guardarPasarela(pasarela: string, data: any) {
    let config = await this.configRepo.findOne({ where: { pasarela } });

    if (!config) {
      config = this.configRepo.create({ pasarela });
    }

    config.credenciales = data.credenciales;
    config.activa = data.activa;
    config.entorno = data.entorno || 'produccion';

    return await this.configRepo.save(config);
  }

  // 3. Obtener TODAS las cuentas bancarias (Transferencias)
  async listarCuentasBancarias() {
    return await this.configRepo.find({ where: { pasarela: 'transferencia' } });
  }

  // 4. Agregar una nueva cuenta bancaria
  async agregarCuentaBancaria(data: any) {
    const nuevaCuenta = this.configRepo.create({
      pasarela: 'transferencia',
      credenciales: data.credenciales, // { banco, cuenta, cci, titular, instrucciones }
      activa: data.activa !== undefined ? data.activa : true,
    });
    return await this.configRepo.save(nuevaCuenta);
  }

  // 5. Eliminar una cuenta bancaria
  async eliminarCuentaBancaria(id: number) {
    const cuenta = await this.configRepo.findOne({
      where: { id, pasarela: 'transferencia' },
    });
    if (!cuenta) throw new NotFoundException('Cuenta no encontrada');
    await this.configRepo.remove(cuenta);
    return { ok: true };
  }
}
