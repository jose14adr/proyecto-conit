import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsuarioModule } from './usuario/usuario.module';
import { AuthModule } from './auth/auth.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DocenteModule } from './docente/docente.module';
import { AlumnoModule } from './alumno/alumno.module';
import { CursoModule } from './curso/curso.module';
import { TemarioModule } from './temario/temario.module';
import { UnidadModule } from './unidad/unidad.module';
import { SesionModule } from './sesion/sesion.module';
import { GrupoModule } from './grupo/grupo.module';

import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(__dirname, '..', '.env'),
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: 'postgresql://postgres:jcmkd2118110497@db.bwnuvmawjpettbqogmgk.supabase.co:5432/postgres',
        ssl: {
          rejectUnauthorized: false, // Esto funcionará perfecto con Supabase
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
    DocenteModule,
    AlumnoModule,
    CursoModule,
    TemarioModule,
    UnidadModule,
    SesionModule,
    GrupoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
