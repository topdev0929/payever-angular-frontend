import { cloneDeep } from '@pe/checkout/utils';

import { ConnectionDTO } from '../models';

export const connectionFixture: () => ConnectionDTO = () => cloneDeep<ConnectionDTO>({
  _id: 'ivy-connection-id',
  name: 'ivy-connection',
  integration: 'ivy',
});
