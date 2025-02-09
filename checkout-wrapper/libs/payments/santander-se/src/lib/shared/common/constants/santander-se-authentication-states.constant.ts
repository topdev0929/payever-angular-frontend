import { PollingError } from '@pe/checkout/types';

import { AuthenticationSigningStatus } from '../types';

export const SANTANDER_SE_AUTH_STATES: { [key in AuthenticationSigningStatus]: { action(): boolean | never } } = {
  [AuthenticationSigningStatus.Completed]: { action: () => false },
  [AuthenticationSigningStatus.Created]: { action: () => true },
  [AuthenticationSigningStatus.Expired]: { action: () => {
    throw new PollingError('timeout', 'Authentication timed out!');
  } },
};
