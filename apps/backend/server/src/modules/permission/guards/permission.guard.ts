import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REQUIRE_PERMISSIONS_KEY } from '../permission.constants';
import { AuthorizedRequest } from '../permission.types';
import { PermissionService } from '../permission.service';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly permissionService: PermissionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      REQUIRE_PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthorizedRequest>();
    if (!request.user) {
      throw new UnauthorizedException('未登录或登录已失效');
    }

    const authz =
      request.authz ??
      (await this.permissionService.getAuthorizationContext(request.user));
    request.authz = authz;

    if (authz.isSuperAdmin) {
      return true;
    }

    const hasAllPermissions = requiredPermissions.every((permission) =>
      authz.permissionCodes.includes(permission),
    );

    if (!hasAllPermissions) {
      throw new ForbiddenException(
        `缺少接口权限: ${requiredPermissions.join(', ')}`,
      );
    }

    return true;
  }
}
