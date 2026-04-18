import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard as NestAuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { AuthenticatedUser } from '@app/shared';

@Injectable()
export class JwtAuthGuard extends NestAuthGuard('jwt') {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {
    super();
  }

  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest<TUser extends AuthenticatedUser = AuthenticatedUser>(
    err: Error | null,
    user: TUser | false,
    _info: unknown,
  ): TUser {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
