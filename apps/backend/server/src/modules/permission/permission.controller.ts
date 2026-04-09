import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  AssignRolePermissionsDto,
  CreatePermissionDto,
  SetRoleScopeDto,
  UpsertFeatureAclDto,
} from '../../cto/permission.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentAuthz } from './decorators/current-authz.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { RequirePermissions } from './decorators/require-permissions.decorator';
import { PermissionGuard } from './guards/permission.guard';
import { PermissionService } from './permission.service';
import { AuthorizationContext } from './permission.types';

@UseGuards(JwtAuthGuard)
@Controller('crm/permission')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Get('/my-routes')
  async getMyRoutes(
    @CurrentUser() user: AuthorizationContext['user'],
  ): Promise<unknown> {
    return this.permissionService.getMyRoutes(user);
  }

  @UseGuards(PermissionGuard)
  @RequirePermissions('permission:manage')
  @Get('/my-context')
  async getMyContext(@CurrentAuthz() authz: AuthorizationContext | undefined) {
    return authz ?? null;
  }

  @UseGuards(PermissionGuard)
  @RequirePermissions('permission:manage')
  @Get('/all')
  async findAllPermissions() {
    return this.permissionService.findAllPermissions();
  }

  @UseGuards(PermissionGuard)
  @RequirePermissions('permission:manage')
  @Post('/create')
  async createPermission(@Body() dto: CreatePermissionDto) {
    return this.permissionService.createPermission(dto);
  }

  @UseGuards(PermissionGuard)
  @RequirePermissions('permission:manage')
  @Post('/role/assign')
  async assignRolePermissions(@Body() dto: AssignRolePermissionsDto) {
    return this.permissionService.assignRolePermissions(dto);
  }

  @UseGuards(PermissionGuard)
  @RequirePermissions('permission:manage')
  @Get('/role/:roleId')
  async getRolePermissions(@Param('roleId', ParseIntPipe) roleId: number) {
    return this.permissionService.getRolePermissions(roleId);
  }

  @UseGuards(PermissionGuard)
  @RequirePermissions('permission:manage')
  @Post('/role/scope/upsert')
  async upsertRoleScope(@Body() dto: SetRoleScopeDto) {
    return this.permissionService.upsertRoleScope(dto);
  }

  @UseGuards(PermissionGuard)
  @RequirePermissions('permission:manage')
  @Get('/role/scope/:roleId')
  async getRoleScopes(@Param('roleId', ParseIntPipe) roleId: number) {
    return this.permissionService.getRoleScopes(roleId);
  }

  @UseGuards(PermissionGuard)
  @RequirePermissions('permission:manage')
  @Post('/feature-acl/upsert')
  async upsertFeatureAcl(@Body() dto: UpsertFeatureAclDto) {
    return this.permissionService.upsertFeatureAcl(dto);
  }

  @UseGuards(PermissionGuard)
  @RequirePermissions('permission:manage')
  @Get('/feature-acl/:subjectType/:subjectId')
  async getFeatureAclBySubject(
    @Param('subjectType') subjectType: string,
    @Param('subjectId') subjectId: string,
  ) {
    return this.permissionService.getFeatureAclBySubject(subjectType, subjectId);
  }
}

