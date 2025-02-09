import {
  ChangeDetectionStrategy, ChangeDetectorRef,
  Component, EventEmitter, Inject, Injector,
  Input, OnInit, Output, TemplateRef,
  ViewChild,
  ViewContainerRef,
  createNgModule,
} from '@angular/core';
import { EMPTY, merge, Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { ChangePaymentDataInterface, FlowInterface } from '@pe/checkout/types';
import { PeDestroyService } from '@pe/destroy';

import { ModeEnum } from '../../form-mode.enum';

import { LAZY_PAYMENT_SECTIONS, LazyPaymentSectionsInterface } from './lazy-payment-sections.token';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'section-container',
  templateUrl: 'section-container.component.html',
  providers: [PeDestroyService],
})
export class SectionContainerComponent implements OnInit {
  @ViewChild('container', { read: ViewContainerRef }) containerRef: ViewContainerRef;

  @Input() isExpandAll = false;
  @Input() isLastStep = false;
  @Input() merchantMode = false;
  @Input() embeddedMode = false;
  @Input() doSubmit$: Subject<void>;
  @Input() step: string;
  @Input() flowId: string;
  @Input() flow: FlowInterface;
  @Input() nodeFormOptions: any;
  @Input() mode: ModeEnum;
  @Input() paymentMethod: string;
  @Input() isBillingAddressStepVisible = false;
  @Input() template?: TemplateRef<any>;

  @Output() continue = new EventEmitter<any>();
  @Output() changePaymentMethod: EventEmitter<ChangePaymentDataInterface> = new EventEmitter();
  @Output() updateFormData: EventEmitter<any> = new EventEmitter();

  constructor(
    protected injector: Injector,
    protected cdr: ChangeDetectorRef,
    @Inject(LAZY_PAYMENT_SECTIONS) private lazyPaymentSteps: LazyPaymentSectionsInterface,
    private destroy$: PeDestroyService,
  ) {}

  ngOnInit() {
    if (this.step in this.lazyPaymentSteps) {
      this.lazyPaymentSteps[this.step]()
        .then((module) => {
          const factory = createNgModule(module, this.injector);
          const componentType = (factory.instance as any).resolveComponent();
          const component = this.containerRef.createComponent(componentType, {
            index: 0,
            injector: factory.injector,
          });
          const instance = component.instance as any;
          instance.nodeFormOptions = this.nodeFormOptions;
          instance.currencyCode = this.flow.currency;
          instance.flowForBillingAddress = this.flow;
          instance.flowCart = this.flow.cart;
          instance.flowTotal = this.flow.total;
          instance.flowApiCall = this.flow.apiCall;
          instance.businessId = this.flow.businessId;
          instance.businessName = this.flow.businessName;
          instance.isLastStep = this.isLastStep;
          instance.mode = this.mode;
          instance.submit$ = this.doSubmit$;
          instance.isBillingAddressStepVisible = this.isBillingAddressStepVisible;
          instance.isExpandAll = this.isExpandAll;

          merge(
            instance.submitted?.pipe(tap((event: unknown) => this.continue.emit(event))) ?? EMPTY,
            instance.updateFormData?.pipe(tap(data => this.updateFormData.emit(data))) ?? EMPTY,
          ).pipe(
            takeUntil(this.destroy$),
          ).subscribe();

          component.changeDetectorRef.detectChanges();
          this.cdr.detectChanges();
        });
    } else {
      throw new Error(`Invalid component\n${JSON.stringify(this.step)}`);
    }
  }
}
