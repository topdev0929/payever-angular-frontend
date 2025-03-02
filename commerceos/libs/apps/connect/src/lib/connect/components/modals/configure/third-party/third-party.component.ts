import { HttpClient } from '@angular/common/http';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewChild,
} from '@angular/core';
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import { ActivatedRoute } from '@angular/router';
import { ApmService } from '@elastic/apm-rum-angular';
import { BehaviorSubject, Observable, Subject, of, combineLatest, EMPTY } from 'rxjs';
import { catchError, filter, finalize, switchMap, take, takeUntil, tap } from 'rxjs/operators';

import { PeAuthService } from '@pe/auth';
import { PE_ENV, EnvironmentConfigInterface as EnvInterface, NodeJsBackendConfigInterface } from '@pe/common';
import { ConfirmActionDialogComponent } from "@pe/confirm-action-dialog";
import { InfoBoxSettingsConfirmContent, ThirdPartyFormServiceInterface } from '@pe/forms';
import { TranslateService } from '@pe/i18n';
import { MediaService } from '@pe/media';
import { PE_OVERLAY_DATA } from '@pe/overlay-widget';
import { ThirdPartyRootFormComponent } from '@pe/tpm';

import {
  IntegrationsStateService,
  BusinessInterface,
  BusinessService,
  IntegrationInfoWithStatusInterface,
  PaymentsStateService,
  NavigationService,
  IntegrationCategory,
  UserBusinessInterface,
  KeysStateService,
  UninstallService,
} from '../../../../../shared';
import {
  FullSynchronizationService, ThirdPartyFormService, ThirdPartyInternalFormService, OldThirdPartyFormService,
} from '../../../../services';

enum ConfirmActionTypes {
  FormDisconnect = "form-disconnect",
  List = "list",
}

@Component({
  selector: 'connect-third-party',
  templateUrl: './third-party.component.html',
  styles: [`
    :host {
      display: block;
      overflow-y: overlay;
      height: 100%;
    }
  `],
  providers: [FullSynchronizationService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfigureThirdPartyComponent implements OnInit, AfterViewInit, OnDestroy {

  useOldApproach = false;

  withPadding = false;
  integrationName: string;
  integrationCategory: string;
  category: string;
  integration: IntegrationInfoWithStatusInterface;

  isLoadingSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isLoading$: Observable<boolean> = this.isLoadingSubject.asObservable();

  private confirmResponseSubject = new Subject<InfoBoxSettingsConfirmContent>();
  public confirmResponse$ = this.confirmResponseSubject.asObservable();

  onDataLoad: BehaviorSubject<number> = this.overlayData.onDataLoad;

  isOnboardingLoading = false;
  onboardingRequiredFields: string[] = []; // TODO

  payEverFieldsData: any = {
    pe_fullSynchronization: false,
  };

  business: BusinessInterface = null;
  apiKeysEditorEnabled$: Observable<boolean> = of(false);
  onboardingFormEnabled$: Observable<boolean> = of(false);

  thirdPartyService: ThirdPartyFormServiceInterface = null;
  @ViewChild('thirdPartyRootForm') thirdPartyRootForm: ThirdPartyRootFormComponent;

  redirectUri = `${location.protocol}//${location.host}/` +
    `business/${this.businessService.businessId}/connect/close-popup-tpm`;

  protected destroy$ = new Subject<void>();

  constructor(
    @Inject(PE_ENV) private envConfig: EnvInterface,
    @Inject(PE_OVERLAY_DATA) public overlayData: any,
    private apmService: ApmService,
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
    public dialog: MatDialog,
    private peAuthService: PeAuthService,
    public uninstallService: UninstallService,
  ) {
  }

  ngOnInit(): void {

    this.integrationName = this.overlayData?.integrationName || this.activatedRoute.snapshot.params['name'];
    this.integrationCategory = this.overlayData?.integrationCategory || this.activatedRoute.snapshot.params['category'];
    this.withPadding = this.overlayData?.withPadding;

    this.isLoadingSubject.next(true);
    combineLatest([
      this.integrationsStateService.getIntegration(this.integrationName).pipe(filter(d => !!d)),
      this.paymentsStateService.getUserBusiness(this.businessUuid).pipe(filter(d => !!d)),
    ]).pipe(
      take(1),
      switchMap((data) => {
        const integration = data[0];
        const business = data[1];
        this.category = integration.category;
        this.business = business;

        const sync = this.category === IntegrationCategory.Products ?
          this.fullSynchronizationService.getValue(this.businessUuid, integration._id).pipe(
            takeUntil(this.destroy$),
            catchError(err => of(false))
          ) :
          of (false);

        return sync.pipe(
          switchMap((fullSynchronization) => {
            this.integration = integration;
            this.payEverFieldsData.pe_fullSynchronization = fullSynchronization;
            if (integration.extension) {
              this.thirdPartyService = new ThirdPartyInternalFormService(
                this.envConfig, this.httpClient, this.mediaService, this.translateService, business, this.integration
              );
            } else if (integration.connect) { // Instant payment, Facebook, commerceostools
              const service = new ThirdPartyFormService(
                this.envConfig, this.apmService, this.peAuthService, this.httpClient, this.businessUuid, this.integration
              );
              this.apiKeysEditorEnabled$ = service.apiKeysEditorEnabled$;
              this.onboardingFormEnabled$ = service.onboardingFormEnabled$;
              if (this.integration.connect.sendApiKeys) {
                return this.apiKeysStateService.getPluginApiKeys(this.integrationName).pipe(
                  filter(d => !!d),
                  tap((keys) => {
                    service.setApiKeys(keys);
                    if (this.thirdPartyService) {
                      // Condition is to not reload on first initю
                      // But we reload TPM form on every API key change
                      this.thirdPartyRootForm.startThirdParty();
                    }
                    this.onDataLoad.next(1);
                    this.thirdPartyService = service;
                    this.cdr.detectChanges();
                  }),
                );
              } else {
                this.thirdPartyService = service;
                this.cdr.detectChanges();
              }
            } else {
              this.useOldApproach = true;
              this.thirdPartyService = new OldThirdPartyFormService(this.envConfig,
                this.httpClient, this.businessUuid, this.integration);
            }
            this.cdr.detectChanges();
            this.onDataLoad.next(1);

            return EMPTY;
          }),
        );
      }),
      finalize(() => this.isLoadingSubject.next(false)),
    ).subscribe();
  }

  ngAfterViewInit() {
    this.overlayData.isLoading?.next(false);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onPayEverFieldSave = (data) => {
    return this.fullSynchronizationService.saveValue(
    this.businessUuid, this.integration._id, data['pe_fullSynchronization']);
  }

  handleClose(): void {
    this.navigationService.returnBack();
  }

  handleConfirmBox(event) {
    const config: MatDialogConfig<any> = {
      data: {
        title: this.translateService.translate('tpm.forms.confirm.are_you_sure'),
        cancelButtonTitle: this.translateService.translate('tpm.forms.no'),
        confirmButtonTitle: this.translateService.translate('tpm.forms.yes'),
      },
      panelClass: 'dialog-dismiss-integration-changes',
      backdropClass:  'dialog-dismiss-integration-changes-backdrop',
    };
    const dialogRef = this.dialog.open(ConfirmActionDialogComponent, config);
    dialogRef.afterClosed().subscribe((dismiss: boolean | undefined) => {
      if (dismiss) {
        this.confirmResponseSubject.next(event.operations.find(item => item.action === ConfirmActionTypes.FormDisconnect));
      } else {
        this.confirmResponseSubject.next(event.operations.find(item => item.action === ConfirmActionTypes.List));
      }
    });
  }

  get businessUuid(): string {
    return this.businessService.businessId;
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
      },
    };
  }

  // API keys

  onKeysChanged(): void {}

  // Onboarding. Not finished yet

  onOnboardingSubmitSuccess(data: UserBusinessInterface): void {}

  onOnboardingSubmitFailed(error: any): void {}

  onOnboardingReady(isReady: boolean): void {}
}
