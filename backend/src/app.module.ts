import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsuarioModule } from './usuario/usuario.module';
import { AuthModule } from './auth/auth.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdministradorModule } from './administrador/administrador.module';
import { DocenteModule } from './docente/docente.module';
import { AlumnoModule } from './alumno/alumno.module';
import { CursoModule } from './curso/curso.module';
import { TemarioModule } from './temario/temario.module';
import { UnidadModule } from './unidad/unidad.module';
import { SesionModule } from './sesion/sesion.module';
import { GrupoModule } from './grupo/grupo.module';
import { MatriculaModule } from './matricula/matricula.module';
import { PagoModule } from './pago/pago.module';
import { RecursoModule } from './recurso/recurso.module';
import { join } from 'path';
import { TareaModule } from './tarea/tarea.module';
import { SesionVivoModule } from './sesion-vivo/sesion-vivo.module';
import { HistorialLoginModule } from './historial-login/historial-login.module';
import { CursoModuloModule } from './curso_modulo/curso_modulo.module';
import { CursoLeccionModule } from './curso_leccion/curso_leccion.module';
import { LeccionMaterialModule } from './leccion-material/leccion-material.module';
import { VimeoService } from './vimeo/vimeo.service';
import { VimeoController } from './vimeo/vimeo.controller';
import { VimeoModule } from './vimeo/vimeo.module';
import { EntregasVideoModule } from './entregas-video/entregas-video.module';
import { MultimediaModule } from './multimedia/multimedia.module';
import { SoporteModule } from './soporte/soporte.module';
import { ExamenModule } from './examen/examen.module';
import { PensionModule } from './pension/pension.module';
import { DocenteCursoAdicionalModule } from './docente-curso-adicional/docente-curso-adicional.module';
import { ExamenPreguntaModule } from './examen_pregunta/examen_pregunta.module';
import { ExamenOpcionModule } from './examen_opcion/examen_opcion.module';
import { ExamenIntentoModule } from './examen_intento/examen_intento.module';
import { GoogleMeetService } from './google-meet/google-meet.service';
import { GoogleMeetModule } from './google-meet/google-meet.module';
import { MailService } from './mail/mail.service';
import { MailModule } from './mail/mail.module';
import { S3Service } from './s3/s3.service';
import { S3Module } from './s3/s3.module';
import { CertificadoModule } from './certificado/certificado.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(__dirname, '..', '.env'),
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres' as 'postgres',
        url: config.get<string>('DATABASE_URL'),
        ssl: {
          rejectUnauthorized: false,
        },
        autoLoadEntities: true,
        synchronize: false,
      }),
    }),

    MailerModule.forRoot({
      transport: {
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
          user: 'aileen.stracke@ethereal.email',
          pass: 'YmeNPD6mkBxUMNvjPx',
        },
      },
      defaults: {
        from: '"Soporte" <antonio@conit.lat>',
      },
    }),

    UsuarioModule,
    AuthModule,
    AdministradorModule,
    DocenteModule,
    AlumnoModule,
    CursoModule,
    TemarioModule,
    UnidadModule,
    SesionModule,
    GrupoModule,
    MatriculaModule,
    PagoModule,
    RecursoModule,
    TareaModule,
    SesionVivoModule,
    HistorialLoginModule,
    CursoModuloModule,
    CursoLeccionModule,
    LeccionMaterialModule,
    VimeoModule,
    EntregasVideoModule,
    MultimediaModule,
    SoporteModule,
    ExamenModule,
    PensionModule,
    DocenteCursoAdicionalModule,
    ExamenPreguntaModule,
    ExamenOpcionModule,
    ExamenIntentoModule,
    S3Module,
    GoogleMeetModule,
    MailModule,
    CertificadoModule,
  ],

  controllers: [AppController],
  providers: [AppService, GoogleMeetService, MailService, S3Service],
})
export class AppModule {}
