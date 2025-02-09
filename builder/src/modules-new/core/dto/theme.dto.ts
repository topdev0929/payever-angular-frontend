import { AppTypeEnum, ThemeTypeEnum } from '../core.entities';

export interface GetAppThemesDto {
  businessId: string;
  applicationId: string;
  active?: boolean;
  populateCurrentVersion?: boolean;
}

export interface ThemeCreateDto extends ThemeEditDto {
  type: ThemeTypeEnum;
  active: boolean;
  businessId: string;
  logo: string;
  appId: string;
  appType: AppTypeEnum;
}

export class ThemeEditDto {
  name?: string;
  currentVersion = '';
  pages?: string[] = [];
  active = false;
}
