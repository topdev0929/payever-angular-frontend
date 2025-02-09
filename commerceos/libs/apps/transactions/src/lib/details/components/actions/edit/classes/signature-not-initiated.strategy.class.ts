import { BaseEditStrategyClass, EditStrategyInterface } from './abstract-base.strategy.class';

export class SignatureNotInitiatedStrategyClass extends BaseEditStrategyClass implements EditStrategyInterface {
  get confirmHeadings() {
    return null;
  }

  checkFlow() {
    this.isEditAble$.next(true);
  }

  showConfirmation() {
    return;
  }
}
