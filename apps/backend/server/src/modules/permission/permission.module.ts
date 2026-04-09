import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgriFeatureAcl } from '../../entities/agri-feature-acl.entity';
import { AgriFeature } from '../../entities/agri-feature.entity';
import { Permission } from '../../entities/permission.entity';
import { RolePermission } from '../../entities/role-permission.entity';
import { RoleScope } from '../../entities/role-scope.entity';
import { Role } from '../../entities/role.entity';
import { FeatureAclGuard } from './guards/feature-acl.guard';
import { PermissionGuard } from './guards/permission.guard';
import { ScopeGuard } from './guards/scope.guard';
import { PermissionController } from './permission.controller';
import { PermissionService } from './permission.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Permission,
      RolePermission,
      RoleScope,
      AgriFeatureAcl,
      Role,
      AgriFeature,
    ]),
  ],
  controllers: [PermissionController],
  providers: [PermissionService, PermissionGuard, ScopeGuard, FeatureAclGuard],
  exports: [PermissionService, PermissionGuard, ScopeGuard, FeatureAclGuard],
})
export class PermissionModule {}

