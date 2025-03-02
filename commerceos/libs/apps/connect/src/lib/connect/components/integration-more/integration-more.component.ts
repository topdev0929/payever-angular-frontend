/**
 * Inner component of integration-full-page, displays more content at the bottom of the page
 */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { get } from 'lodash-es';
import { filter, takeUntil } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';

import { IntegrationInfoWithStatusInterface, IntegrationsStateService, NavigationService } from '../../../shared';

@Component({
  selector: 'connect-integration-more',
  templateUrl: './integration-more.component.html',
  styleUrls: ['./integration-more.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    PeDestroyService,
  ],
})
export class IntegrationMoreComponent implements OnChanges {

  @Input() integration: IntegrationInfoWithStatusInterface;
  integrations: IntegrationInfoWithStatusInterface[] = [];

  constructor(
    private integrationsStateService: IntegrationsStateService,
    private cd: ChangeDetectorRef,
    private router: Router,
    private navigationService: NavigationService,
    private readonly destroy$: PeDestroyService,
  ) {
  }

  /**
   * Init component
   * @param changes - changes
   */
  ngOnChanges(changes: SimpleChanges) {
    if (get(changes, 'integration.currentValue.category')) {
      this.integrationsStateService.getCategoriesIntegrations(false, [this.integration.category], true).pipe(
        takeUntil(this.destroy$),
        filter(d => !!d),
      ).subscribe((items) => {
        this.integrations = items.filter(item => this.integration._id !== item._id).slice(0, 4);
        this.cd.detectChanges();
      });
    }
  }

  /**
   * Navigate to integrations page with specific category
   */
  navigate() {
    const businessId = this.integrationsStateService.getBusinessId();
    this.navigationService.saveReturn(
      `business/${businessId}/connect/${this.integration.category}/integrations/${this.integration.name}/fullpage`,
    );
    this.router.navigate(
      [`business/${businessId}/connect/${this.integration.category}/`],
      { queryParams: { integrationName: this.integration.name } },
    );
  }
}
