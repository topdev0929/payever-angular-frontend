import { ChangeDetectionStrategy, Component , Injector, OnInit } from '@angular/core';
import { merge } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';

import {
  AbstractAction,
  ActionTypeEnum,
  VerifyModeEnum,
  VerifyPayloadInterface,
} from '../../../../shared';

import { VERIFY_PAYMENTS_CONTROLS } from './constants';
import { VerifyService } from './verify.service';

@Component({
  selector: 'pe-verify-action',
  templateUrl: './verify.component.html',
  styleUrls: ['./verify.component.scss', '../actions.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    PeDestroyService,
  ],
})
export class ActionVerifyComponent extends AbstractAction implements OnInit {

  isSubmitted = false;

  typeErrorKey: string;

  constructor(
    private verifyService: VerifyService,
    public injector: Injector,
  ) {
    super(injector);
  }

  verificationData(order) {
    const field = VERIFY_PAYMENTS_CONTROLS[order.payment_option.type];
    const data = {
      field,
      mode: field?.mode,
    };

    if (!!order.details.pos_verify_type && !field) {
      data.mode = VerifyModeEnum.Simple;
    }

    return data;
  }

  seTypeErrorKey(key: string): void {
    this.typeErrorKey = key;
  }

  ngOnInit(): void {
    this.getData();

    merge(
      this.verifyService.done$.pipe(tap(data => this.verify(data))),
      this.verifyService.errorKey$.pipe(tap(data => this.seTypeErrorKey(data))),
      this.order$.pipe(
        tap((order) => {
          const verificationData = this.verificationData(order);
          this.verifyService.setField(verificationData.field);
          this.router.navigate([verificationData.mode], {
            relativeTo: this.route,
            queryParamsHandling: 'merge',
            skipLocationChange: true,
          });
        }),
      )
    ).pipe(
      takeUntil(this.destroy$),
    ).subscribe();

  }

  done(): void {
    this.verifyService.startVerification();
  }

  // It is necessary to output errors depending on the type of verification
  showError(error) {
    this.toggleMessage(this.typeErrorKey);
  }

  verify({ data, dataKey }: VerifyPayloadInterface): void {
    this.isSubmitted = true;

    this.sendAction(
      data,
      ActionTypeEnum.Verify,
      dataKey,
      false
    );
  }

  createForm(): void {
    // prevent sonar and eslint errors
  }

  private toggleMessage(translateKey: string): void {
    const key = this.translateService.hasTranslation(translateKey) ? translateKey : 'transactions.errors.unknown';
    this.snackbarService.toggle(true, {
      content: this.translateService.translate(key),
    });
  }
}
