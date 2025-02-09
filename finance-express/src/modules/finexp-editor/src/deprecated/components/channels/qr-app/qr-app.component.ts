import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subject, combineLatest } from 'rxjs';

import { PE_ENV, EnvironmentConfigInterface as EnvInterface } from '@pe/common';
import { ThirdPartyFormServiceInterface } from '@pe/forms';
import { MediaService } from '@pe/media';

import {
  FinexpHeaderAbstractService,
  FinexpApiAbstractService,
  FinexpStorageAbstractService
} from '../../../services';
import { BusinessInterface, IntegrationConnectInfoInterface } from '../../../interfaces';
import { ThirdPartyInternalFormService } from './third-party-form.service';

@Component({
  // tslint:disable-next-line component-selector
  selector: 'qr-app',
  templateUrl: './qr-app.component.html'
})
export class QRAppComponent implements OnInit, OnDestroy {

  integration: IntegrationConnectInfoInterface = null;
  business: BusinessInterface = null;
  thirdPartyService: ThirdPartyFormServiceInterface = null;

  protected destroyed$: Subject<boolean> = new Subject();

  constructor(
    private activatedRoute: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef,
    private headerService: FinexpHeaderAbstractService,
    private mediaService: MediaService,
    private router: Router,
    private apiService: FinexpApiAbstractService,
    private httpClient: HttpClient,
    private storageService: FinexpStorageAbstractService,
    @Inject(PE_ENV) private env: EnvInterface
  ) {}

  get checkoutUuid(): string {
    return this.activatedRoute.snapshot.params['checkoutUuid'] || this.activatedRoute.parent.snapshot.params['checkoutUuid'];
  }

  ngOnInit() {
    this.storageService.getCheckoutByIdOnce(this.checkoutUuid).subscribe(currentCheckout => {
      this.storageService.getChannelSetsOnce().subscribe(channelSets => {
        // this.terminalList = [];
        channelSets.map(channelSet => {
          if (channelSet.type === 'link' && channelSet.checkout === this.checkoutUuid) {
            combineLatest([
              this.apiService.getConnectIntegrationInfo(this.storageService.businessUuid, 'qr'),
              this.apiService.getBusiness(this.storageService.businessUuid)
            ]).subscribe(data => {
              this.integration = data[0];
              this.business = data[1];
              this.thirdPartyService = new ThirdPartyInternalFormService(
                this.env, this.httpClient,
                this.storageService.businessUuid, this.business.name,
                this.mediaService.getMediaUrl(currentCheckout.logo, 'images'), currentCheckout._id, this.integration,
                this.getCheckoutWrapperCustomerViewLink(channelSet.id)
              );
              this.changeDetectorRef.markForCheck();
            });
          }
          return channelSet;
        });
        this.headerService.setShortHeader('connect.qr.title', () => this.goBack());
      });
    });
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  getCheckoutWrapperCustomerViewLink(channelSet: string): string {
    return `${this.env.frontend.checkoutWrapper}/pay/create-flow-from-qr/channel-set-id/${channelSet}`;
  }

  goBack() {
    this.router.navigate([this.storageService.getHomeChannelsUrl(this.checkoutUuid)]);
  }
}
