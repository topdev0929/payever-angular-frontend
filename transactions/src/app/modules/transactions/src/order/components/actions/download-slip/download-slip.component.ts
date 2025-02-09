import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { combineLatest } from 'rxjs';

import { HeaderService, ApiService, UserBusinessInterface, ShippingSlipInterface } from '../../../../shared';
import { DetailService } from '../../../services';

@Component({
  selector: 'or-download-slip',
  templateUrl: './download-slip.component.html',
  styleUrls: ['./download-slip.component.scss']
})
export class ActionDownloadSlipComponent implements OnInit {

  data: ShippingSlipInterface = null;
  business: UserBusinessInterface = null;
  businessId: string = null;
  shippingOrderId: string = null;

  constructor(
    private headerService: HeaderService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private detailService: DetailService,
    private apiService: ApiService
  ) { }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params: Params) => {
      this.businessId = params.uuid;
      this.shippingOrderId = params.shippingOrderId;

      this.fetchData();
    });

    setTimeout(() => {
      this.headerService.setShortHeader(
        'form.download_slip.heading',
        () => this.goBack()
      );
    });
  }

  private goBack(): void {
    this.router.navigate(['../../../'], { relativeTo: this.activatedRoute });
  }

  private fetchData(): void {
    combineLatest([
      this.apiService.getShippingSlip(this.businessId, this.shippingOrderId),
      this.apiService.getBusinessData()
    ]).subscribe(
      res => {
        this.data = res[0];
        this.business = res[1];
      },
      err => {
        this.detailService.handleError(err, true);
      }
    );
  }
}
