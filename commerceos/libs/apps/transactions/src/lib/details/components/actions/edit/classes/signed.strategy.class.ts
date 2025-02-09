import { tap } from 'rxjs/operators';

import { Headings } from '@pe/confirmation-screen';

import { BaseEditStrategyClass, EditStrategyInterface } from './abstract-base.strategy.class';

export class SignedStrategyClass extends BaseEditStrategyClass implements EditStrategyInterface {
  get confirmHeadings(): Headings {
    const translationsScope = 'transactions.details.actions.confirmation';

    return  {
      title: this.translateService.translate(`${translationsScope}.overwriteContract.title`),
      subtitle: this.translateService.translate(`${translationsScope}.overwriteContract.subtitle`),
      confirmBtnText: this.translateService.translate(`${translationsScope}.overwriteContract.confirmBtnText`),
      declineBtnText: this.translateService.translate(`${translationsScope}.overwriteContract.declineBtnText`),
    };
  }

  checkFlow() {
    this.showConfirmation();
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
        // signature will be withdrawn on successful edit on CWF.
        // see https://payeverorg.atlassian.net/browse/KA-792
        
        this.isEditAble$.next(true);
      }),
    ).subscribe();
  }
}
