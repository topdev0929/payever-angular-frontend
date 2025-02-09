import { PebElementWithIntegration } from '@pe/builder/core';
import { PebElement } from '@pe/builder/render-utils';

export function toElementWithIntegrationTree(element: PebElement): PebElementWithIntegration {
  return {
    id: element.id,
    name: element.name,
    type: element.type,
    integration: element.integration,
    children: [...element.children ?? []].map((childElement: PebElement) =>
      toElementWithIntegrationTree(childElement)),
  };
}
