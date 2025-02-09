import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { PeAppEnv } from '@pe/app-env';
import { PebEnvService } from '@pe/builder/core';

import { PeBuilderShareAccess, PeBuilderShareCustomAccess } from './builder-share.constants';

@Injectable()
export class PeBuilderShareApi {

  constructor(
    private http: HttpClient,
    private pebEnvService: PebEnvService,
  ) {
  }

  customAccess(access: PeBuilderShareAccess,appEnv:PeAppEnv): Observable<PeBuilderShareCustomAccess> {

    return this.http.post<PeBuilderShareCustomAccess>(
      `${appEnv.builder}/api/business/${this.pebEnvService.businessId}/application/${appEnv.id}/custom-access`,
      { access },
    );
  };
}
