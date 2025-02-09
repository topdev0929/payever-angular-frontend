import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { filter, finalize, take, takeUntil } from 'rxjs/operators';

import { TranslateService } from '@pe/i18n';
import { PE_OVERLAY_DATA } from '@pe/overlay-widget';

import {
  IntegrationsStateService, IntegrationInfoWithStatusInterface,
  PaymentsStateService, NavigationService
} from '../../../shared';

@Component({
  selector: 'integration-installed',
  templateUrl: './integration-installed.component.html',
  styleUrls: ['./integration-installed.component.scss']
})
export class IntegrationInstalledComponent implements OnInit, OnDestroy {

  name: string = this.overlayData.integrationName;
  onAction: BehaviorSubject<number> = this.overlayData.onAction;
  onDataLoad: BehaviorSubject<number> = this.overlayData.onDataLoad;
  installed: boolean;
  integration: IntegrationInfoWithStatusInterface;

  isLoadingSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isLoading$: Observable<boolean> = this.isLoadingSubject.asObservable();
  protected destroyed$: Subject<boolean> = new Subject();

  constructor(
    private _location: Location,
    private activatedRoute: ActivatedRoute,
    private integrationsStateService: IntegrationsStateService,
    private paymentsStateService: PaymentsStateService,
    private navigationService: NavigationService,
    private translateService: TranslateService,
    private router: Router,
    @Inject(PE_OVERLAY_DATA) public overlayData: any,
  ) {}

  ngOnInit(): void {
    this.isLoadingSubject.next(true);
    this.integrationsStateService.getIntegration(this.name)
      .pipe(filter(d => !!d), take(1))
      .subscribe(integration => {
      this.integration = integration;
      this.installed = integration._status ? integration._status.installed : false;
      this.isLoadingSubject.next(false);
      this.onDataLoad.next(1);
    }, () => this.onDataLoad.next(1));
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  handleClose(): void {
    this.onAction.next(1);
  }

  handleOpen(): void {
    this.onAction.next(1);
    const businessId = this.integrationsStateService.getBusinessId();
    this.router.navigate([`business/${businessId}/connect/${this.integration.category}/configure/${this.integration.name}`]);
  }
}
