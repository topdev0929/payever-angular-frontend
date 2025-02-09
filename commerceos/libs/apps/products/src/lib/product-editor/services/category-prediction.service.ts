import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { EnvService, EnvironmentConfigInterface, PE_ENV } from '@pe/common';

@Injectable()
export class CategoryPredictionApiService {

  constructor(
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
    private http: HttpClient,
    private envService: EnvService,
  ) { }

  getPredictions(title: string): Observable<{ predictions: string[] }> {
    const businessId: string = this.envService.businessId;
    const url = `${this.env.backend.products}/business/${businessId}/categories/predict`;

    return this.http.get<any>(url, { params: { title } });
  }
}
