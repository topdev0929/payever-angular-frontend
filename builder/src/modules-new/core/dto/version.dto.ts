import { PebDocument } from '@pe/builder-core';

export interface CreateVersionDto {
  applicationTheme: string;
  current: boolean;
  name: string;
  pages: PebDocument[];
  published?: boolean;
  routes?: string[];
}
