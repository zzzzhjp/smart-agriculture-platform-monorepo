import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REQUIRE_SCOPES_KEY } from '../permission.constants';
import { AuthorizedRequest } from '../permission.types';
import { PermissionService } from '../permission.service';

@Injectable()
export class ScopeGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly permissionService: PermissionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredScopes = this.reflector.getAllAndOverride<string[]>(
      REQUIRE_SCOPES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredScopes || requiredScopes.length === 0) {
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

    if (
      authz.isSuperAdmin ||
      authz.hasAllScope ||
      this.permissionService.hasRequiredScopes(authz, requiredScopes)
    ) {
      return true;
    }

    throw new ForbiddenException(
      `缺少数据范围授权: ${requiredScopes.join(', ')}`,
    );
  }
}
