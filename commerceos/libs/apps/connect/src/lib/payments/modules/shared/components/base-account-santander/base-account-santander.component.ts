import { EventEmitter, Output, Directive, ChangeDetectorRef, OnInit } from '@angular/core';

import { IntegrationsStateService, UserBusinessInterface } from '../../../../../shared';
import { BasePaymentComponent } from '../base-payment.component';

@Directive()
export abstract class BaseAccountSantanderComponent extends BasePaymentComponent implements OnInit {

  abstract requiredFields: string[];
  abstract sendApplicationOnSave: boolean;

  @Output() additionalInfoSaved: EventEmitter<void> = new EventEmitter();

  business: UserBusinessInterface = null;
  isReady = false;
  isLoading = false;

  private integrationsStateService: IntegrationsStateService = this.injector.get(IntegrationsStateService);
  private cdr: ChangeDetectorRef = this.injector.get(ChangeDetectorRef);

  ngOnInit() {
    this.integrationsStateService.getUserBusinessesOnce().subscribe((business) => {
      this.business = business;
      this.cdr.detectChanges();
    });
  }

  onSubmitSuccess(data: UserBusinessInterface): void {}

  onSubmitFailed(error: any): void {
    this.handleError(error, true);
  }

  onReady(isReady: boolean): void {
    this.isReady = isReady;
  }
}
