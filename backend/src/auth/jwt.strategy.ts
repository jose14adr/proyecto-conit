import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { HistorialLoginService } from 'src/historial-login/historial-login.service';

interface JwtPayload {
  sub: number;
  correo: string;
  rol: string;
  sessionId: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private historialLoginService: HistorialLoginService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'secretKey',
    });
  }

  validate(payload: JwtPayload) {
    if (payload.sessionId) {
      const sesionSigueActiva = this.historialLoginService.verificarSesionActiva(payload.sessionId);
      if (!sesionSigueActiva) {
        throw new UnauthorizedException('La sesión ha sido cerrada');
      }
    }
    return { userId: payload.sub, correo: payload.correo, rol: payload.rol };
  }
}
