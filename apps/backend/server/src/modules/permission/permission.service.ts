import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, In, Repository } from 'typeorm';
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
import {
  AuthorizationContext,
  FeatureAccessDecision,
  FeatureAclAction,
  ScopeSummary,
} from './permission.types';

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

  private normalizeScopeType(scopeType?: string): string {
    return scopeType?.trim().toUpperCase() || '';
  }

  private normalizeScopeValue(scopeValue?: string): string {
    return scopeValue?.trim() || '*';
  }

  private normalizeSubjectType(subjectType?: string): string {
    return subjectType?.trim().toUpperCase() || '';
  }

  private buildScopeSummary(roleScopes: RoleScope[]): ScopeSummary {
    const scopeMap: Record<string, string[]> = {};

    for (const scope of roleScopes) {
      const scopeType = this.normalizeScopeType(scope.scopeType);
      const scopeValue = this.normalizeScopeValue(scope.scopeValue);

      if (!scopeMap[scopeType]) {
        scopeMap[scopeType] = [];
      }

      if (!scopeMap[scopeType].includes(scopeValue)) {
        scopeMap[scopeType].push(scopeValue);
      }
    }

    const scopeTypes = Object.keys(scopeMap);

    return {
      hasAllScope: scopeTypes.includes('ALL'),
      hasSelfOnlyScope: scopeTypes.includes('SELF_ONLY'),
      scopeTypes,
      scopeMap,
    };
  }

  private matchScopeValue(
    scopeValues: string[] = [],
    candidates: unknown[],
  ): boolean {
    if (scopeValues.includes('*')) {
      return true;
    }

    const normalizedCandidates = candidates
      .filter((value) => value !== undefined && value !== null)
      .map((value) => String(value).trim())
      .filter(Boolean);

    return normalizedCandidates.some((candidate) =>
      scopeValues.includes(candidate),
    );
  }

  private canAccessFeatureByScope(
    feature: AgriFeature,
    authz: AuthorizationContext,
  ): boolean {
    if (authz.isSuperAdmin || authz.hasAllScope) {
      return true;
    }

    if (
      this.matchScopeValue(authz.scopeMap.FARM, [feature.farmId]) ||
      this.matchScopeValue(authz.scopeMap.ORG, [
        feature.ownerOrgId,
        feature.ownerOrg,
      ]) ||
      this.matchScopeValue(authz.scopeMap.FEATURE_TYPE, [feature.featureType]) ||
      this.matchScopeValue(authz.scopeMap.PARCEL_TYPE, [feature.subtype]) ||
      this.matchScopeValue(authz.scopeMap.ANALYSIS_TYPE, [
        feature.permissionTag,
        feature.attrs?.analysis_type,
        feature.attrs?.analysisType,
      ])
    ) {
      return true;
    }

    if (!authz.hasSelfOnlyScope) {
      return false;
    }

    const userId = String(authz.user.sub);

    return this.matchScopeValue(['*'], [
      feature.createdBy,
      feature.updatedBy,
      feature.ownerPerson,
      feature.manager,
      userId,
      authz.user.admin_account,
    ]);
  }

  private getAclFlagName(action: FeatureAclAction): keyof Pick<
    AgriFeatureAcl,
    'canRead' | 'canUpdate' | 'canDelete'
  > {
    switch (action) {
      case 'read':
        return 'canRead';
      case 'delete':
        return 'canDelete';
      case 'update':
      default:
        return 'canUpdate';
    }
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

  async getPermissionCodesByRole(roleId: number): Promise<string[]> {
    const rolePermissions = await this.rolePermissionRepository.find({
      where: { roleId },
      relations: ['permission'],
    });

    return [
      ...new Set(
        rolePermissions
          .map((item) => item.permission?.code?.trim())
          .filter((code): code is string => Boolean(code)),
      ),
    ];
  }

  async getRoleScopeSummary(roleId: number): Promise<ScopeSummary> {
    const roleScopes = await this.roleScopeRepository.find({
      where: { roleId },
      order: { id: 'ASC' },
    });

    return this.buildScopeSummary(roleScopes);
  }

  async getAuthorizationContext(
    user: JwtPayload,
  ): Promise<AuthorizationContext> {
    const isSuperAdmin = this.isSuperAdmin(user?.role_name);

    if (!user?.role_id) {
      return {
        user,
        roleId: user?.role_id,
        roleName: user?.role_name,
        isSuperAdmin,
        permissionCodes: [],
        hasAllScope: false,
        hasSelfOnlyScope: false,
        scopeTypes: [],
        scopeMap: {},
      };
    }

    if (isSuperAdmin) {
      return {
        user,
        roleId: user.role_id,
        roleName: user.role_name,
        isSuperAdmin: true,
        permissionCodes: ['*'],
        hasAllScope: true,
        hasSelfOnlyScope: true,
        scopeTypes: ['ALL'],
        scopeMap: { ALL: ['*'] },
      };
    }

    const [permissionCodes, scopeSummary] = await Promise.all([
      this.getPermissionCodesByRole(user.role_id),
      this.getRoleScopeSummary(user.role_id),
    ]);

    return {
      user,
      roleId: user.role_id,
      roleName: user.role_name,
      isSuperAdmin: false,
      permissionCodes,
      ...scopeSummary,
    };
  }

  hasRequiredScopes(
    authz: AuthorizationContext,
    requiredScopes: string[],
  ): boolean {
    if (authz.isSuperAdmin || authz.hasAllScope) {
      return true;
    }

    const normalizedRequiredScopes = requiredScopes
      .map((scope) => this.normalizeScopeType(scope))
      .filter(Boolean);

    if (normalizedRequiredScopes.length === 0) {
      return true;
    }

    return normalizedRequiredScopes.some((scope) =>
      authz.scopeTypes.includes(scope),
    );
  }

  async checkFeatureAccess(
    user: JwtPayload,
    featureId: string | number,
    action: FeatureAclAction,
    expectedFeatureType?: string,
  ): Promise<FeatureAccessDecision> {
    const authz = await this.getAuthorizationContext(user);
    const feature = await this.agriFeatureRepository.findOne({
      where: { id: String(featureId) },
    });

    if (!feature) {
      throw new NotFoundException('地理对象不存在');
    }

    if (
      expectedFeatureType &&
      feature.featureType.trim().toLowerCase() !==
        expectedFeatureType.trim().toLowerCase()
    ) {
      throw new ForbiddenException('地理对象类型与接口要求不匹配');
    }

    if (authz.isSuperAdmin) {
      return {
        allowed: true,
        action,
        reason: 'super_admin',
        feature,
      };
    }

    if (this.canAccessFeatureByScope(feature, authz)) {
      return {
        allowed: true,
        action,
        reason: 'role_scope',
        feature,
      };
    }

    const aclFlag = this.getAclFlagName(action);
    const subjectPairs = [
      {
        subjectType: 'ADMIN',
        subjectId: String(user.sub),
      },
      user.role_id
        ? {
            subjectType: 'ROLE',
            subjectId: String(user.role_id),
          }
        : null,
    ].filter(
      (
        subject,
      ): subject is {
        subjectType: string;
        subjectId: string;
      } => Boolean(subject),
    );

    if (subjectPairs.length === 0) {
      return {
        allowed: false,
        action,
        reason: 'denied',
        feature,
      };
    }

    const acls = await this.agriFeatureAclRepository
      .createQueryBuilder('acl')
      .where('acl.feature_id = :featureId', { featureId: String(featureId) })
      .andWhere(
        new Brackets((qb) => {
          subjectPairs.forEach((subject, index) => {
            qb[index === 0 ? 'where' : 'orWhere'](
              `(acl.subject_type = :subjectType${index} AND acl.subject_id = :subjectId${index})`,
              {
                [`subjectType${index}`]: subject.subjectType,
                [`subjectId${index}`]: subject.subjectId,
              },
            );
          });
        }),
      )
      .getMany();

    const allowed = acls.some((acl) => Boolean(acl[aclFlag]));

    return {
      allowed,
      action,
      reason: allowed ? 'feature_acl' : 'denied',
      feature,
    };
  }

  async findAllPermissions(): Promise<Permission[]> {
    return this.permissionRepository.find({ order: { id: 'ASC' } });
  }

  async createPermission(dto: CreatePermissionDto): Promise<Permission> {
    const code = dto.code?.trim();
    const name = dto.name?.trim();

    if (!code || !name) {
      throw new BadRequestException('code and name are required');
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
      throw new NotFoundException('role not found');
    }

    const permissionIds = [
      ...new Set((dto.permission_ids || []).map((id) => String(id))),
    ];
    if (permissionIds.length === 0) {
      throw new BadRequestException('permission_ids cannot be empty');
    }

    const permissions = await this.permissionRepository.find({
      where: { id: In(permissionIds) },
    });
    if (permissions.length !== permissionIds.length) {
      throw new BadRequestException('invalid permission_id detected');
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
      throw new NotFoundException('role not found');
    }

    const scopeType = this.normalizeScopeType(dto.scope_type);
    const scopeValue = this.normalizeScopeValue(dto.scope_value);

    if (!scopeType) {
      throw new BadRequestException('scope_type cannot be empty');
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
    const subjectType = this.normalizeSubjectType(dto.subject_type);
    const subjectId = String(dto.subject_id);
    const featureId = String(dto.feature_id);

    if (!subjectType || !subjectId || !featureId) {
      throw new BadRequestException(
        'subject_type/subject_id/feature_id cannot be empty',
      );
    }

    const feature = await this.agriFeatureRepository.findOne({
      where: { id: featureId },
    });

    if (!feature) {
      throw new NotFoundException('feature not found');
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
        subjectType: this.normalizeSubjectType(subjectType),
        subjectId,
      },
      relations: ['feature'],
      order: { id: 'ASC' },
    });
  }
}
