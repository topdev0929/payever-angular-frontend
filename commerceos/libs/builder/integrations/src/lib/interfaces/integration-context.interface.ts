import { PebContext, PebDesign, PebIntegration } from '@pe/builder/core';

export interface PebElementIntegrationContext<T extends PebElementIntegrationContext<T>> {
  id: string;
  name?: string;
  parent?: any;
  integration?: PebIntegration;
  context?: PebContext;
  design?: PebDesign;
  children?: Iterable<T> & { length: number };
}

export interface PebContextFetchConfig {
  businessId: string;
  builderApi: string;
  queryParams: { [key: string]: string };
}
