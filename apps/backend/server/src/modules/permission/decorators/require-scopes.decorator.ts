import { SetMetadata } from '@nestjs/common';
import { REQUIRE_SCOPES_KEY } from '../permission.constants';
import { RoleScopeType } from '../permission.types';

export const RequireScopes = (...scopeTypes: Array<RoleScopeType | string>) =>
  SetMetadata(REQUIRE_SCOPES_KEY, scopeTypes);
