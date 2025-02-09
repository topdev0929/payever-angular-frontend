/**
 * Component for page Ratings & Reviews of the integration
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';
import { PE_OVERLAY_DATA } from '@pe/overlay-widget';

import { IntegrationInfoWithStatusInterface, IntegrationsStateService, NavigationService } from '../../../shared';

@Component({
  selector: 'connect-integration-all-reviews',
  templateUrl: './integration-all-reviews.component.html',
  styleUrls: ['./integration-all-reviews.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    PeDestroyService,
  ],
})
export class IntegrationAllReviewsComponent implements OnInit {

  integration: IntegrationInfoWithStatusInterface;

  constructor(
    private activatedRoute: ActivatedRoute,
    private integrationsStateService: IntegrationsStateService,
    private cdr: ChangeDetectorRef,
    private navigationService: NavigationService,
    private router: Router,
    @Inject(PE_OVERLAY_DATA) public overlayData: any,
    private readonly destroy$: PeDestroyService,
  ) {
  }

  /**
   * Load current integration
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
   * Handle close button click from header
   */
  handleClose(): void {
    this.navigationService.returnBack();
  }

  /**
   * Back to the app page
   */
  back() {
    const businessId = this.integrationsStateService.getBusinessId();
    this.router.navigate([
      `business/${businessId}/connect/${this.integration.category}/integrations/${this.integration.name}/fullpage`]);
  }
}
