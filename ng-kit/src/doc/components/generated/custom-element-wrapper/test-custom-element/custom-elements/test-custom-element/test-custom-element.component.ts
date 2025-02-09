import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Injector,
  Input,
  Output,
  ViewEncapsulation
} from '@angular/core';

import { CustomElementWrapperComponent } from '../../../../../../../../src/kit/custom-element-wrapper';

@Component({
  changeDetection: ChangeDetectionStrategy.Default, // Must be Default
  selector: 'test-custom-element',
  templateUrl: './test-custom-element.component.html',
  styleUrls: ['./test-custom-element.component.scss'],
  // tslint:disable-next-line use-view-encapsulation
  encapsulation: ViewEncapsulation.None
})
export class TestCustomElementComponent extends CustomElementWrapperComponent {

  submitForm$: EventEmitter<void> = new EventEmitter<void>();
  @Input('submitform') set setSubmitForm(value: any) {
    if (this.checkInputEventEmit(value)) {
      this.submitForm$.next(this.parseInputEventEmit(value));
    }
  }

  payForOrder$: EventEmitter<any> = new EventEmitter<void>();
  @Input('payfororder') set setPayForOrder(value: any) {
    if (this.checkInputEventEmit(value)) {
      this.payForOrder$.next(this.parseInputEventEmit(value));
    }
  }

  valueBoolean: boolean = false;
  @Input('valueboolean') set setValueBoolean(value: any) {
    this.valueBoolean = this.parseInputBoolean(value);
  }

  valueNumber: number = 0;
  @Input('valuenumber') set setValueNumber(value: any) {
    this.valueNumber = this.parseInputNumber(value);
  }

  valueString: string = '';
  @Input('valuestring') set setValueString(value: any) {
    this.valueString = this.parseInputString(value);
  }

  valueObject: {} = {};
  @Input('valueobject') set setValueObject(value: any) {
    this.valueObject = this.parseInputObject(value);
  }

  @Output('saved') saved: EventEmitter<{}> = new EventEmitter();

  constructor(protected injector: Injector) {
    super(injector);
  }

  protected getI18nDomains(): string[] {
    return [
      'checkout-section-address'
    ];
  }

  protected getIconsPack(): string[] {
    return [
      'set',
      'payment',
      'payment-methods',
      'payment-test', // Non existing. Will generate 404.
      'shipping'
    ];
  }
}
