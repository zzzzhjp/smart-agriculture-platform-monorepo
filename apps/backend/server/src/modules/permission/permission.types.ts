import { Request } from 'express';
import { AgriFeature } from '../../entities/agri-feature.entity';
import { JwtPayload } from '../auth/strategies/jwt.strategy';
import { ACL_ACTIONS, ROLE_SCOPE_TYPES } from './permission.constants';

export type RoleScopeType = (typeof ROLE_SCOPE_TYPES)[number];
export type FeatureAclAction = (typeof ACL_ACTIONS)[number];

export interface ScopeSummary {
  hasAllScope: boolean;
  hasSelfOnlyScope: boolean;
  scopeTypes: string[];
  scopeMap: Record<string, string[]>;
}

export interface AuthorizationContext extends ScopeSummary {
  user: JwtPayload;
  roleId?: number;
  roleName?: string;
  isSuperAdmin: boolean;
  permissionCodes: string[];
}

export interface FeatureAclMetadata {
  featureType: string;
  param?: string;
  action?: FeatureAclAction;
}

export interface FeatureAccessDecision {
  allowed: boolean;
  action: FeatureAclAction;
  reason: 'super_admin' | 'role_scope' | 'feature_acl' | 'denied';
  feature: AgriFeature | null;
}

export interface AuthorizedRequest extends Request {
  user: JwtPayload;
  authz?: AuthorizationContext;
  featureAccess?: FeatureAccessDecision;
}
