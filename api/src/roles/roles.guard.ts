import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from './roles.enum';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Deny by default: a route guarded by RolesGuard must say which roles it allows.
    if (!requiredRoles?.length) {
      throw new ForbiddenException('No roles configured for this route.');
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new UnauthorizedException('No user in request');
    }

    if (!requiredRoles.includes(user.role as Role)) {
      throw new ForbiddenException(
        'You do not have permission for this route.',
      );
    }

    return true;
  }
}
