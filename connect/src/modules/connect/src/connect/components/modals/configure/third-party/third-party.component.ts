import {
  ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewChild
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject, of, combineLatest } from 'rxjs';
import { catchError, filter, flatMap, map, take, takeUntil } from 'rxjs/operators';

import { ThirdPartyFormServiceInterface, ThirdPartyRootFormComponent } from '@pe/forms';
import { PE_ENV, EnvironmentConfigInterface as EnvInterface, NodeJsBackendConfigInterface } from '@pe/common';
import { TranslateService } from '@pe/i18n';
import { MediaService } from '@pe/media';
import { PE_OVERLAY_DATA } from '@pe/overlay-widget';


import {
  IntegrationsStateService,
  BusinessInterface,
  BusinessService,
  IntegrationInfoWithStatusInterface,
  PaymentsStateService,
  NavigationService,
  IntegrationCategory,
  UserBusinessInterface,
  PaymentMethodEnum,
  KeysStateService,
  UninstallService
} from '../../../../../shared';
import {
  FullSynchronizationService, ThirdPartyFormService, ThirdPartyInternalFormService, OldThirdPartyFormService
} from '../../../../services';

@Component({
  selector: 'connect-third-party',
  templateUrl: './third-party.component.html',
  providers: [FullSynchronizationService]
})
export class ConfigureThirdPartyComponent implements OnInit, OnDestroy {

  useOldApproach: boolean = false;

  integrationName: string;
  integrationCategory: string;
  integration: IntegrationInfoWithStatusInterface;

  isLoadingSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isLoading$: Observable<boolean> = this.isLoadingSubject.asObservable();
  onDataLoad: BehaviorSubject<number> = this.overlayData.onDataLoad;

  isOnboardingLoading: boolean = false;
  onboardingRequiredFields: string[] = []; // TODO

  payEverFieldsData: any = {
    pe_fullSynchronization: false
  };

  business: BusinessInterface = null;
  apiKeysEditorEnabled$: Observable<boolean> = of(false);
  onboardingFormEnabled$: Observable<boolean> = of(false);

  thirdPartyService: ThirdPartyFormServiceInterface = null;
  @ViewChild('thirdPartyRootForm') thirdPartyRootForm: ThirdPartyRootFormComponent;

  protected destroyed$: Subject<boolean> = new Subject();

  constructor(
    @Inject(PE_ENV) private envConfig: EnvInterface,
    @Inject(PE_OVERLAY_DATA) public overlayData: any,
    private httpClient: HttpClient,
    private activatedRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private fullSynchronizationService: FullSynchronizationService,
    private navigationService: NavigationService,
    private integrationsStateService: IntegrationsStateService,
    private paymentsStateService: PaymentsStateService,
    private businessService: BusinessService,
    private apiKeysStateService: KeysStateService,
    private mediaService: MediaService,
    private translateService: TranslateService,
    public uninstallService: UninstallService,
  ) {
  }

  ngOnInit(): void {

    this.integrationName = this.overlayData?.integrationName || this.activatedRoute.snapshot.params['name'];
    this.integrationCategory = this.overlayData?.integrationCategory || this.activatedRoute.snapshot.params['category'];

    this.isLoadingSubject.next(true);

    combineLatest([
      this.integrationsStateService.getIntegration(this.integrationName).pipe(filter(d => !!d), take(1), takeUntil(this.destroyed$)),
      this.paymentsStateService.getUserBusiness(this.businessUuid).pipe(filter(d => !!d), take(1), takeUntil(this.destroyed$))
    ]).subscribe(data => {
      const integration = data[0];
      const business = data[1];
      this.business = business;
      const sync = integration.category === IntegrationCategory.Products ?
        this.fullSynchronizationService.getValue(this.businessUuid, integration._id).pipe(
          takeUntil(this.destroyed$),
          catchError(err => of(false))
        ) :
        of (false);

      sync.subscribe(fullSynchronization => {
        this.integration = integration;
        this.payEverFieldsData.pe_fullSynchronization = fullSynchronization;
        if (integration.extension) {
          this.thirdPartyService = new ThirdPartyInternalFormService(
            this.envConfig, this.httpClient, this.mediaService, this.translateService, business, this.integration
          );
        } else if (integration.connect) { // Instant payment, Facebook, commerceostools
          const service = new ThirdPartyFormService(
            this.envConfig, this.httpClient, this.businessUuid, this.integration
          );
          this.apiKeysEditorEnabled$ = service.apiKeysEditorEnabled$;
          this.onboardingFormEnabled$ = service.onboardingFormEnabled$;
          if (this.integration.connect.sendApiKeys) {
            this.apiKeysStateService.getPluginApiKeys(this.integrationName).pipe(
              takeUntil(this.destroyed$), filter(d => !!d)
            ).subscribe(keys => {
              service.setApiKeys(keys);
              if (this.thirdPartyService) {
                // Condition is to not reload on first initю
                // But we reload TPM form on every API key change
                this.thirdPartyRootForm.startThirdParty();
              }
              this.thirdPartyService = service;
              this.cdr.detectChanges();
            });
          } else {
            this.thirdPartyService = service;
            this.cdr.detectChanges();
          }
        } else {
          this.useOldApproach = true;
          this.thirdPartyService = new OldThirdPartyFormService(this.envConfig, this.httpClient, this.businessUuid, this.integration);
        }
        this.isLoadingSubject.next(false);
        this.cdr.detectChanges();
        this.onDataLoad.next(1);
      });
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  onPayEverFieldSave = data => {
    return this.fullSynchronizationService.saveValue(this.businessUuid, this.integration._id, data['pe_fullSynchronization']);
  }

  handleClose(): void {
    this.navigationService.returnBack();
  }

  get businessUuid(): string {
    return this.businessService.getBusinessId();
  }

  get baseApiUrl(): string {
    const config: NodeJsBackendConfigInterface = this.envConfig.backend;
    return `${config.thirdParty}/api/business/${this.businessUuid}/subscription/${this.integrationName}/call`;
  }

  get baseApiData(): any {
    return {
      authStateData: {
        businessUuid: this.businessUuid,
        integrationName: this.integrationName,
        integrationCategory: this.integrationCategory,
        integrationId: this.integration ? this.integration._id : null,
      }
    };
  }

  // API keys

  onKeysChanged(): void {
    // this.thirdPartyRootForm.reloadData();
  }

  // Onboarding. Not finished yet

  onOnboardingSubmitSuccess(data: UserBusinessInterface): void {
    this.isOnboardingLoading = true;
    this.paymentsStateService.refreshUserBusinesses(this.integrationName as PaymentMethodEnum).pipe(
      flatMap(() => {
        return this.paymentsStateService.saveConnectPaymentPayload(this.integrationName as PaymentMethodEnum, { application_sent: true }).pipe(
          map(() => null)
        );
      })
    ).subscribe(() => {
      // this.paymentsStateService.saveUserBusinesses(this.paymentMethod, this.form.value, this.sendApplicationOnSave).subscribe(data => {
      this.isOnboardingLoading = false;
      // this.thirdPartyRootForm.reloadData();
    }, error => {
      this.paymentsStateService.handleError(error, true);
      // TODO Map errors
      // this.showPanelWithError();
      this.isOnboardingLoading = false;
    });
  }

  onOnboardingSubmitFailed(error: any): void {
    // TODO
    // this.handleError(error, true);
  }

  onOnboardingReady(isReady: boolean): void {
    // Nothing to do here
  }
}
