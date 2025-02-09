import { PebInteractionType } from '@pe/builder/core';

export const integrations = [
  { name: 'Integration Actions', value: PebInteractionType.IntegrationAction },
];

export const integrationInitValue = {
  integrationAction: {
    id: '',
    connectorId: '',
    title: '',
    method: '',
  },
};
