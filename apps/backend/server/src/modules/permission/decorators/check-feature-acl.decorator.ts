import { SetMetadata } from '@nestjs/common';
import { FEATURE_ACL_KEY } from '../permission.constants';
import { FeatureAclAction, FeatureAclMetadata } from '../permission.types';

export const CheckFeatureAcl = (
  featureType: string,
  options: {
    param?: string;
    action?: FeatureAclAction;
  } = {},
) =>
  SetMetadata(FEATURE_ACL_KEY, {
    featureType,
    param: options.param,
    action: options.action,
  } satisfies FeatureAclMetadata);
