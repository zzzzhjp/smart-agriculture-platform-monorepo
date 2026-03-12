import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { AgriFeature } from '../../entities/agri-feature.entity';
import { AgriFeatureAcl } from '../../entities/agri-feature-acl.entity';
import { Permission } from '../../entities/permission.entity';
import { RolePermission } from '../../entities/role-permission.entity';
import { RoleScope } from '../../entities/role-scope.entity';
import { Role } from '../../entities/role.entity';
import {
  AssignRolePermissionsDto,
  CreatePermissionDto,
  SetRoleScopeDto,
  UpsertFeatureAclDto,
} from '../../cto/permission.dto';
import { JwtPayload } from '../auth/strategies/jwt.strategy';

interface RouteMeta {
  title: string;
  icon?: string;
}

interface AppRoute {
  path: string;
  name: string;
  componentKey: string;
  meta: RouteMeta;
  children?: AppRoute[];
}

interface RouteDefinition extends AppRoute {
  permissionCode?: string;
  children?: RouteDefinition[];
}

const ROUTE_DEFINITIONS: RouteDefinition[] = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    componentKey: 'Layout',
    meta: { title: '工作台', icon: 'home' },
    children: [
      {
        path: '/dashboard/home',
        name: 'DashboardHome',
        componentKey: 'views/dashboard/index',
        meta: { title: '首页' },
      },
    ],
  },
  {
    path: '/agri',
    name: 'Agri',
    componentKey: 'Layout',
    meta: { title: '农业地图', icon: 'map' },
    children: [
      {
        path: '/agri/feature/list',
        name: 'AgriFeatureList',
        componentKey: 'views/agri/feature-list/index',
        meta: { title: '地块列表' },
        permissionCode: 'agri_feature:read',
      },
      {
        path: '/agri/feature/edit',
        name: 'AgriFeatureEdit',
        componentKey: 'views/agri/feature-edit/index',
        meta: { title: '地块编辑' },
        permissionCode: 'agri_feature:update',
      },
      {
        path: '/agri/feature/delete',
        name: 'AgriFeatureDelete',
        componentKey: 'views/agri/feature-delete/index',
        meta: { title: '地块删除' },
        permissionCode: 'agri_feature:delete',
      },
    ],
  },
  {
    path: '/system',
    name: 'System',
    componentKey: 'Layout',
    meta: { title: '系统管理', icon: 'setting' },
    children: [
      {
        path: '/system/role',
        name: 'SystemRole',
        componentKey: 'views/system/role/index',
        meta: { title: '角色管理' },
        permissionCode: 'role:manage',
      },
      {
        path: '/system/permission',
        name: 'SystemPermission',
        componentKey: 'views/system/permission/index',
        meta: { title: '权限管理' },
        permissionCode: 'permission:manage',
      },
    ],
  },
];

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(RolePermission)
    private readonly rolePermissionRepository: Repository<RolePermission>,
    @InjectRepository(RoleScope)
    private readonly roleScopeRepository: Repository<RoleScope>,
    @InjectRepository(AgriFeatureAcl)
    private readonly agriFeatureAclRepository: Repository<AgriFeatureAcl>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(AgriFeature)
    private readonly agriFeatureRepository: Repository<AgriFeature>,
  ) {}

  private isSuperAdmin(roleName?: string): boolean {
    if (!roleName) {
      return false;
    }

    const normalizedRoleName = roleName.trim().toLowerCase();
    return (
      normalizedRoleName === 'super_admin' ||
      normalizedRoleName === 'superadmin' ||
      normalizedRoleName === '超级管理员'
    );
  }

  private removePermissionCode(routes: RouteDefinition[]): AppRoute[] {
    return routes.map((route) => ({
      path: route.path,
      name: route.name,
      componentKey: route.componentKey,
      meta: route.meta,
      children: route.children
        ? this.removePermissionCode(route.children)
        : undefined,
    }));
  }

  private filterRoutesByPermission(
    routes: RouteDefinition[],
    permissionCodes: Set<string>,
  ): AppRoute[] {
    const result: AppRoute[] = [];

    for (const route of routes) {
      const filteredChildren = route.children
        ? this.filterRoutesByPermission(route.children, permissionCodes)
        : [];

      const selfAllowed =
        !route.permissionCode || permissionCodes.has(route.permissionCode);

      if (!selfAllowed && filteredChildren.length === 0) {
        continue;
      }

      result.push({
        path: route.path,
        name: route.name,
        componentKey: route.componentKey,
        meta: route.meta,
        children: filteredChildren.length > 0 ? filteredChildren : undefined,
      });
    }

    return result;
  }

  async getMyRoutes(user: JwtPayload): Promise<AppRoute[]> {
    if (!user?.role_id) {
      return [];
    }

    if (this.isSuperAdmin(user.role_name)) {
      return this.removePermissionCode(ROUTE_DEFINITIONS);
    }

    const rolePermissions = await this.rolePermissionRepository.find({
      where: { roleId: user.role_id },
      relations: ['permission'],
    });

    const permissionCodes = new Set(
      rolePermissions
        .map((item) => item.permission?.code)
        .filter((code): code is string => Boolean(code)),
    );

    return this.filterRoutesByPermission(ROUTE_DEFINITIONS, permissionCodes);
  }

  async findAllPermissions(): Promise<Permission[]> {
    return this.permissionRepository.find({ order: { id: 'ASC' } });
  }

  async createPermission(dto: CreatePermissionDto): Promise<Permission> {
    const code = dto.code?.trim();
    const name = dto.name?.trim();

    if (!code || !name) {
      throw new BadRequestException('code 和 name 不能为空');
    }

    const exists = await this.permissionRepository.findOne({ where: { code } });
    if (exists) {
      return exists;
    }

    return this.permissionRepository.save({
      code,
      name,
      description: dto.description?.trim() || null,
    });
  }

  async assignRolePermissions(
    dto: AssignRolePermissionsDto,
  ): Promise<RolePermission[]> {
    const role = await this.roleRepository.findOne({ where: { id: dto.role_id } });
    if (!role) {
      throw new NotFoundException('角色不存在');
    }

    const permissionIds = [
      ...new Set((dto.permission_ids || []).map((id) => String(id))),
    ];
    if (permissionIds.length === 0) {
      throw new BadRequestException('permission_ids 不能为空');
    }

    const permissions = await this.permissionRepository.find({
      where: { id: In(permissionIds) },
    });
    if (permissions.length !== permissionIds.length) {
      throw new BadRequestException('存在无效 permission_id');
    }

    const existing = await this.rolePermissionRepository.find({
      where: { roleId: dto.role_id },
    });

    const existingMap = new Set(existing.map((item) => item.permissionId));
    const newRecords = permissionIds
      .filter((permissionId) => !existingMap.has(permissionId))
      .map((permissionId) =>
        this.rolePermissionRepository.create({
          roleId: dto.role_id,
          permissionId,
        }),
      );

    if (newRecords.length > 0) {
      await this.rolePermissionRepository.save(newRecords);
    }

    return this.rolePermissionRepository.find({
      where: { roleId: dto.role_id },
      order: { id: 'ASC' },
    });
  }

  async getRolePermissions(roleId: number): Promise<RolePermission[]> {
    return this.rolePermissionRepository.find({
      where: { roleId },
      relations: ['permission'],
      order: { id: 'ASC' },
    });
  }

  async upsertRoleScope(dto: SetRoleScopeDto): Promise<RoleScope> {
    const role = await this.roleRepository.findOne({ where: { id: dto.role_id } });
    if (!role) {
      throw new NotFoundException('角色不存在');
    }

    const scopeType = dto.scope_type?.trim();
    const scopeValue = dto.scope_value?.trim() || '*';

    if (!scopeType) {
      throw new BadRequestException('scope_type 不能为空');
    }

    const existing = await this.roleScopeRepository.findOne({
      where: {
        roleId: dto.role_id,
        scopeType,
        scopeValue,
      },
    });

    if (existing) {
      return existing;
    }

    return this.roleScopeRepository.save({
      roleId: dto.role_id,
      scopeType,
      scopeValue,
    });
  }

  async getRoleScopes(roleId: number): Promise<RoleScope[]> {
    return this.roleScopeRepository.find({
      where: { roleId },
      order: { id: 'ASC' },
    });
  }

  async upsertFeatureAcl(dto: UpsertFeatureAclDto): Promise<AgriFeatureAcl> {
    const subjectType = dto.subject_type?.trim();
    const subjectId = String(dto.subject_id);
    const featureId = String(dto.feature_id);

    if (!subjectType || !subjectId || !featureId) {
      throw new BadRequestException('subject_type/subject_id/feature_id 不能为空');
    }

    const feature = await this.agriFeatureRepository.findOne({
      where: { id: featureId },
    });

    if (!feature) {
      throw new NotFoundException('地块不存在');
    }

    const existing = await this.agriFeatureAclRepository.findOne({
      where: {
        subjectType,
        subjectId,
        featureId,
      },
    });

    if (existing) {
      existing.canRead = dto.can_read ?? existing.canRead;
      existing.canUpdate = dto.can_update ?? existing.canUpdate;
      existing.canDelete = dto.can_delete ?? existing.canDelete;
      return this.agriFeatureAclRepository.save(existing);
    }

    return this.agriFeatureAclRepository.save({
      subjectType,
      subjectId,
      featureId,
      canRead: dto.can_read ?? false,
      canUpdate: dto.can_update ?? false,
      canDelete: dto.can_delete ?? false,
    });
  }

  async getFeatureAclBySubject(
    subjectType: string,
    subjectId: string,
  ): Promise<AgriFeatureAcl[]> {
    return this.agriFeatureAclRepository.find({
      where: {
        subjectType,
        subjectId,
      },
      relations: ['feature'],
      order: { id: 'ASC' },
    });
  }
}
