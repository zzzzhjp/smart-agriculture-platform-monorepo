import { SetMetadata } from '@nestjs/common';
import { REQUIRE_PERMISSIONS_KEY } from '../permission.constants';

export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(REQUIRE_PERMISSIONS_KEY, permissions);
