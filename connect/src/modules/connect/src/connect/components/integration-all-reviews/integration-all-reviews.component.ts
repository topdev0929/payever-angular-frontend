/**
 * Component for page Ratings & Reviews of the integration
 */

import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { takeUntil, filter } from 'rxjs/operators';

import { PE_OVERLAY_DATA } from '@pe/overlay-widget';

import {
  AbstractComponent, IntegrationsStateService,
  IntegrationInfoWithStatusInterface, NavigationService
} from '../../../shared';

@Component({
  selector: 'connect-integration-all-reviews',
  templateUrl: './integration-all-reviews.component.html',
  styleUrls: ['./integration-all-reviews.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IntegrationAllReviewsComponent extends AbstractComponent implements OnInit {

  integration: IntegrationInfoWithStatusInterface;

  constructor(
    private activatedRoute: ActivatedRoute,
    private integrationsStateService: IntegrationsStateService,
    private cdr: ChangeDetectorRef,
    private navigationService: NavigationService,
    private router: Router,
    @Inject(PE_OVERLAY_DATA) public overlayData: any,
  ) {
    super();
  }

  /**
   * Load current integration
   */
  ngOnInit(): void {
    const integrationName = this.overlayData.integrationName;
    this.integrationsStateService.getIntegration(integrationName).pipe(
      takeUntil(this.destroyed$),
      filter(d => !!d)
    ).subscribe(integration => {
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
    this.router.navigate([`business/${businessId}/connect/${this.integration.category}/integrations/${this.integration.name}/fullpage`]);
  }
}
