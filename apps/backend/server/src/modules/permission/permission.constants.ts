export const REQUIRE_PERMISSIONS_KEY = 'require_permissions';
export const REQUIRE_SCOPES_KEY = 'require_scopes';
export const FEATURE_ACL_KEY = 'feature_acl';

export const ROLE_SCOPE_TYPES = [
  'ORG',
  'FARM',
  'PARCEL_TYPE',
  'FEATURE_TYPE',
  'ANALYSIS_TYPE',
  'SELF_ONLY',
  'ALL',
] as const;

export const ACL_ACTIONS = ['read', 'update', 'delete'] as const;
