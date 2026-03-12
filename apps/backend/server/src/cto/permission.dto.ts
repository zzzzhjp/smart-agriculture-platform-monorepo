export interface CreatePermissionDto {
  code: string;
  name: string;
  description?: string;
}

export interface AssignRolePermissionsDto {
  role_id: number;
  permission_ids: Array<string | number>;
}

export interface SetRoleScopeDto {
  role_id: number;
  scope_type: string;
  scope_value?: string;
}

export interface UpsertFeatureAclDto {
  subject_type: string;
  subject_id: string | number;
  feature_id: string | number;
  can_read?: boolean;
  can_update?: boolean;
  can_delete?: boolean;
}
