import { tap } from 'rxjs/operators';

import { Headings } from '@pe/confirmation-screen';

import { BaseEditStrategyClass, EditStrategyInterface } from './abstract-base.strategy.class';

export class SignatureSentStrategyClass extends BaseEditStrategyClass implements EditStrategyInterface {

  get confirmHeadings(): Headings {
    const translationsScope = 'transactions.details.actions.confirmation';

    return  {
      title: this.translateService.translate(`${translationsScope}.cancelSignature.title`),
      subtitle: this.translateService.translate(`${translationsScope}.cancelSignature.subtitle`),
      confirmBtnText: this.translateService.translate(`${translationsScope}.cancelSignature.confirmBtnText`),
      declineBtnText: this.translateService.translate(`${translationsScope}.cancelSignature.declineBtnText`),
    };
  }

  checkFlow() {
    this.getFlowData();
  }

  showConfirmation(): void {
    if (!this.isShowConfirmation) {
      this.isEditAble$.next(true);

      return;
    }

    this.confirmScreenService.show(this.confirmHeadings, true).pipe(
      tap((confirm: boolean) => {
        if (!confirm) {
          this.close$.next();

          return;
        }
        this.isShowConfirmation = false;

        this.sendCancelSigningRequest();
      }),
    ).subscribe();
  }

  private sendCancelSigningRequest(): void {
    const action = 'cancel-signing-request';

    this.apiService.postPaymentAction(action, this.flow.connectionId, this.order.transaction.uuid)
      .subscribe(
        () => {
          this.getData$.next(true);
          this.isEditAble$.next(true);
          this.cancelSigningRequest$.next(true);
        },
        (error) => {
          this.cancelSigningRequest$.next(false);
          this.close$.next();
          error.message = this.translateService.translate(`transactions.action-errors.${action}`);
          this.showError$.next(error);
        },
      );
  }
}
