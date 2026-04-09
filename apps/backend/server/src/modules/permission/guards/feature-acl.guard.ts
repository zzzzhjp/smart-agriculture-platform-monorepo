import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FEATURE_ACL_KEY } from '../permission.constants';
import {
  AuthorizedRequest,
  FeatureAclAction,
  FeatureAclMetadata,
} from '../permission.types';
import { PermissionService } from '../permission.service';

@Injectable()
export class FeatureAclGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly permissionService: PermissionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const metadata = this.reflector.getAllAndOverride<FeatureAclMetadata>(
      FEATURE_ACL_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!metadata) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthorizedRequest>();
    if (!request.user) {
      throw new UnauthorizedException('未登录或登录已失效');
    }

    const featureId = this.getFeatureId(request, metadata);
    if (!featureId) {
      throw new BadRequestException('缺少待校验的地理对象标识');
    }

    const decision = await this.permissionService.checkFeatureAccess(
      request.user,
      featureId,
      metadata.action ?? this.inferAction(request.method),
      metadata.featureType,
    );
    request.featureAccess = decision;

    if (!decision.allowed) {
      throw new ForbiddenException('当前角色无权访问该地理对象');
    }

    return true;
  }

  private getFeatureId(
    request: AuthorizedRequest,
    metadata: FeatureAclMetadata,
  ): string | undefined {
    const candidates = [metadata.param, 'featureId', 'id'].filter(
      (value): value is string => Boolean(value),
    );

    for (const key of candidates) {
      const value =
        (request.params?.[key] as string | undefined) ??
        (request.body?.[key] as string | undefined) ??
        (request.query?.[key] as string | undefined);
      if (value !== undefined && value !== null && `${value}`.trim() !== '') {
        return String(value);
      }
    }

    return undefined;
  }

  private inferAction(method: string): FeatureAclAction {
    switch (method.toUpperCase()) {
      case 'GET':
        return 'read';
      case 'DELETE':
        return 'delete';
      default:
        return 'update';
    }
  }
}
