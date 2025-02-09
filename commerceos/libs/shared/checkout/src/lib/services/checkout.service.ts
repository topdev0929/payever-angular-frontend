import {
  ComponentRef,
  Injectable,
  ViewContainerRef,
} from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { PeSharedCheckoutComponent } from '../checkout.component';
import { PAYEVER_CHECKOUT_PATTERN } from '../constant';
import { WrapperType } from '../interfaces';

@Injectable()
export class PeSharedCheckoutService {
  checkoutComponent!: ComponentRef<PeSharedCheckoutComponent>;
  containerRef!: ViewContainerRef;

  private checkoutWrapperType = new BehaviorSubject<WrapperType | null>(null);

  setCheckoutType(value: WrapperType) {
    this.checkoutWrapperType.next(value);
  }

  getCheckoutType(): Observable<WrapperType | null> {
    return this.checkoutWrapperType.asObservable();
  }

  closeCheckoutWrapper() {
    this.checkoutWrapperType.next(null);
  }

  cleanDeadCheckoutFlows(): void {
    Object.keys(localStorage).forEach((key: string) => {
      key && PAYEVER_CHECKOUT_PATTERN.test(key) && localStorage.removeItem(key);
    });
  }
}
