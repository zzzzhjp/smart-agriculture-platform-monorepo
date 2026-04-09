import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PermissionService } from './permission.service';
import { Permission } from '../../entities/permission.entity';
import { RolePermission } from '../../entities/role-permission.entity';
import { RoleScope } from '../../entities/role-scope.entity';
import { AgriFeatureAcl } from '../../entities/agri-feature-acl.entity';
import { Role } from '../../entities/role.entity';
import { AgriFeature } from '../../entities/agri-feature.entity';

describe('PermissionService', () => {
  let service: PermissionService;
  let rolePermissionRepository: ReturnType<typeof createRepositoryMock>;
  let roleScopeRepository: ReturnType<typeof createRepositoryMock>;
  let agriFeatureAclRepository: ReturnType<typeof createRepositoryMock>;
  let agriFeatureRepository: ReturnType<typeof createRepositoryMock>;

  function createRepositoryMock() {
    return {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
      createQueryBuilder: jest.fn(),
    };
  }

  beforeEach(async () => {
    rolePermissionRepository = createRepositoryMock();
    roleScopeRepository = createRepositoryMock();
    agriFeatureAclRepository = createRepositoryMock();
    agriFeatureRepository = createRepositoryMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionService,
        {
          provide: getRepositoryToken(Permission),
          useValue: createRepositoryMock(),
        },
        {
          provide: getRepositoryToken(RolePermission),
          useValue: rolePermissionRepository,
        },
        {
          provide: getRepositoryToken(RoleScope),
          useValue: roleScopeRepository,
        },
        {
          provide: getRepositoryToken(AgriFeatureAcl),
          useValue: agriFeatureAclRepository,
        },
        {
          provide: getRepositoryToken(Role),
          useValue: createRepositoryMock(),
        },
        {
          provide: getRepositoryToken(AgriFeature),
          useValue: agriFeatureRepository,
        },
      ],
    }).compile();

    service = module.get<PermissionService>(PermissionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('builds authorization context from role permissions and scopes', async () => {
    rolePermissionRepository.find.mockResolvedValue([
      { permission: { code: 'parcel:update' } },
      { permission: { code: 'parcel:read' } },
    ]);
    roleScopeRepository.find.mockResolvedValue([
      { scopeType: 'farm', scopeValue: '101' },
      { scopeType: 'feature_type', scopeValue: 'parcel' },
    ]);

    const context = await service.getAuthorizationContext({
      sub: 1,
      admin_account: 'editor',
      role_id: 2,
      role_name: 'farm_editor',
    });

    expect(context.permissionCodes).toEqual(
      expect.arrayContaining(['parcel:update', 'parcel:read']),
    );
    expect(context.scopeMap.FARM).toEqual(['101']);
    expect(context.scopeMap.FEATURE_TYPE).toEqual(['parcel']);
    expect(context.hasAllScope).toBe(false);
  });

  it('allows feature access by role scope before ACL fallback', async () => {
    rolePermissionRepository.find.mockResolvedValue([]);
    roleScopeRepository.find.mockResolvedValue([
      { scopeType: 'FARM', scopeValue: '1001' },
    ]);
    agriFeatureRepository.findOne.mockResolvedValue({
      id: '88',
      featureType: 'parcel',
      farmId: '1001',
      ownerOrgId: null,
      ownerOrg: null,
      subtype: null,
      permissionTag: null,
      attrs: {},
    });

    const decision = await service.checkFeatureAccess(
      {
        sub: 3,
        admin_account: 'farm-editor',
        role_id: 5,
        role_name: 'editor',
      },
      '88',
      'update',
      'parcel',
    );

    expect(decision.allowed).toBe(true);
    expect(decision.reason).toBe('role_scope');
  });

  it('falls back to feature ACL when scope does not match', async () => {
    rolePermissionRepository.find.mockResolvedValue([]);
    roleScopeRepository.find.mockResolvedValue([]);
    agriFeatureRepository.findOne.mockResolvedValue({
      id: '99',
      featureType: 'parcel',
      farmId: '2002',
      ownerOrgId: null,
      ownerOrg: null,
      subtype: null,
      permissionTag: null,
      attrs: {},
    });

    agriFeatureAclRepository.createQueryBuilder.mockReturnValue({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([{ canUpdate: true }]),
    });

    const decision = await service.checkFeatureAccess(
      {
        sub: 7,
        admin_account: 'outsource',
        role_id: 6,
        role_name: 'viewer',
      },
      '99',
      'update',
      'parcel',
    );

    expect(decision.allowed).toBe(true);
    expect(decision.reason).toBe('feature_acl');
  });
});

