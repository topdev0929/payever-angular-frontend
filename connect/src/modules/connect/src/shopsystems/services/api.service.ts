import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { PluginInfoInterface } from '../types';
import { EnvironmentConfigInterface as EnvInterface, NodeJsBackendConfigInterface, PE_ENV } from '@pe/common';

@Injectable()
export class ShopsystemsApiService {
  constructor(
    protected http: HttpClient,
    @Inject(PE_ENV) private envConfig: EnvInterface,
  ) {}

  getPluginInfo(name: string): Observable<PluginInfoInterface> {
    return this.http.get<PluginInfoInterface>(`${this.config().plugins}/api/plugin/channel/${name}`);
  }

  private config(): NodeJsBackendConfigInterface {
    return this.envConfig.backend;
  }
}
