import { Observable } from 'rxjs';

export interface EnvironmentConfigLoaderServiceInterface {
  loadEnvironmentConfig(): Observable<boolean>;
}
