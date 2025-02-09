import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';

import { EnvironmentConfigInterface, PE_ENV } from '@pe/common';
import { OnboardingDTO, OnboardingRequestDTO } from '@pe/shared/onboarding';

@Injectable({ providedIn: 'root' })
export class PartnerService implements OnDestroy {
  public partnerData: OnboardingDTO;

  private destroy$ = new Subject<void>();
  private partnerDataStore: { [key: string]: Observable<OnboardingDTO> } = {};

  constructor(
    @Inject(PE_ENV) private envConfig: EnvironmentConfigInterface,
    private http: HttpClient,
  ) { }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getPartnerData({ industry = '', country = undefined, app = undefined, fragment = undefined, plugin = undefined }) {
    let url = `${this.envConfig.backend.commerceos}/api/onboarding/cached`;
    const body = new OnboardingRequestDTO(industry, country, app, fragment, plugin);
    const key = `${industry}-${country}-${app}-${fragment}`;
    if (!this.partnerDataStore[key]) {
      this.partnerDataStore[key] = this.http.post<OnboardingDTO>(url, body);
    }

    return this.partnerDataStore[key];
  }

  getPartnerFromLocalStorage(): OnboardingDTO {
    const partnerData = localStorage.getItem('pe-partners-data');

    return partnerData ? JSON.parse(partnerData) : null;
  }
}
