export interface EnvironmentInterface {
  production: boolean;
  test?: boolean;

  assetsPath?: string;
  useStorageForLocale?: boolean;
}
