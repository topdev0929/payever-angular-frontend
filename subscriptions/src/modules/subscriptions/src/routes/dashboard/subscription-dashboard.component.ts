import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

import { AppThemeEnum, EnvService, MessageBus } from '@pe/common';

import { AbstractComponent } from '../../shared/abstract';
import { AbstractSubscriptionBuilderApi } from '../../api/builder/abstract-subscriptionsbuilder.api';
import { PeSubscriptionApi } from '../../api/subscription/abstract.subscription.api';
import { SubscriptionEnvService } from '../../api/subscription/subscription-env.service';

@Component({
  selector: 'peb-subscription-dashboard',
  templateUrl: './subscription-dashboard.component.html',
  styleUrls: ['./subscription-dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebSubscriptionDashboardComponent extends AbstractComponent implements OnInit, OnDestroy{
  editButtonLoading: boolean;
  preview$: Observable<any> = this.apiService.getSitePreview(this.envService.applicationId)
    .pipe(shareReplay(1));

  theme = AppThemeEnum.default;
  subscription: any;

  constructor(
    private cdr: ChangeDetectorRef,
    private messageBus: MessageBus,
    private apiService: AbstractSubscriptionBuilderApi,
    private subscriptionApi: PeSubscriptionApi,
    @Inject(EnvService) private envService: SubscriptionEnvService,
    @Inject('PEB_ENTITY_NAME') private entityName: string,
  ) {
    super();
  }

  ngOnInit(): void {
    this.subscriptionApi.getPlan(this.envService.applicationId).subscribe((subscription) => {
      this.subscription = subscription;
      this.cdr.markForCheck();
    });
  }

  onEditClick(): void {
    this.editButtonLoading = true;
    this.cdr.markForCheck();
    this.messageBus.emit(`${this.entityName}.navigate.edit`, this.envService.applicationId);
  }

  onOpenClick(): void {
    this.messageBus.emit(`${this.entityName}.open`, this.subscription);
  }
}
