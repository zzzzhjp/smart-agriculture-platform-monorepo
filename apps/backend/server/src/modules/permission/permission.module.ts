import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgriFeatureAcl } from '../../entities/agri-feature-acl.entity';
import { AgriFeature } from '../../entities/agri-feature.entity';
import { Permission } from '../../entities/permission.entity';
import { RolePermission } from '../../entities/role-permission.entity';
import { RoleScope } from '../../entities/role-scope.entity';
import { Role } from '../../entities/role.entity';
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
  providers: [PermissionService],
  exports: [PermissionService],
})
export class PermissionModule {}
