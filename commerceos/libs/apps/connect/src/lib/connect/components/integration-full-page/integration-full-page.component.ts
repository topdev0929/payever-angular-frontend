import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';
import { PE_OVERLAY_DATA } from '@pe/overlay-widget';

import {
  IntegrationInfoWithStatusInterface,
  IntegrationsApiService,
  IntegrationsStateService,
  NavigationService,
} from '../../../shared';

@Component({
  selector: 'connect-integration-full-page',
  templateUrl: './integration-full-page.component.html',
  styleUrls: ['./integration-full-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    PeDestroyService,
  ],
})
export class IntegrationFullPageComponent implements OnInit {

  integration: IntegrationInfoWithStatusInterface;

  constructor(
    private activatedRoute: ActivatedRoute,
    private integrationsApiService: IntegrationsApiService,
    private integrationsStateService: IntegrationsStateService,
    private navigationService: NavigationService,
    private cdr: ChangeDetectorRef,
    @Inject(PE_OVERLAY_DATA) public overlayData: any,
    private readonly destroy$: PeDestroyService,
  ) {
  }

  /**
   * Load current integration to pass it to inner components
   */
  ngOnInit(): void {
    const integrationName = this.overlayData.integrationName;
    this.integrationsStateService.getIntegration(integrationName).pipe(
      takeUntil(this.destroy$),
      filter(d => !!d),
    ).subscribe((integration) => {
      this.integration = integration;
      this.cdr.detectChanges();
    });
  }

  /**
   * Handle header close button click
   */
  handleClose(): void {
    this.navigationService.returnBack();
  }
}
