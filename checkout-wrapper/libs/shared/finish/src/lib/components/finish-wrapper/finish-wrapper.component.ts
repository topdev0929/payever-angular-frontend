import { Component,
  ChangeDetectionStrategy,
  Input,
  OnDestroy,
  Output,
  EventEmitter,
  ViewChild,
  Injector,
  TemplateRef,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { ReplaySubject } from 'rxjs';

import { NonFormErrorsService } from '@pe/checkout/form-utils';
import { PluginEventsService } from '@pe/checkout/plugins';
import { CustomElementService, PaymentHelperService } from '@pe/checkout/utils';

import { FinishDialogService } from '../../services';
import { ModalButtonInterface, ModalButtonListInterface } from '../../types';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'checkout-sdk-finish-wrapper',
  styleUrls: ['./finish-wrapper.component.scss'],
  templateUrl: './finish-wrapper.component.html',
})
export class FinishWrapperComponent implements AfterViewInit, OnDestroy {

  @Input() set buttons(buttons: ModalButtonListInterface) {
    this.baseButtons = buttons;
    this.finishDialogService.updateButtons(this.buttonsAsArray);
  }

  get buttons(): ModalButtonListInterface {
    return this.isChangingPaymentMethod || this.isPaymentAlreadySubmitted ? {} : this.baseButtons;
  }

  get buttonsAsArray(): ModalButtonInterface[] {
    return Object.values(this.buttons || {});
  }

  @Input() processingTitle: string;
  @Input() processingText: string;

  @Input() template: TemplateRef<any>;

  @Input() darkMode: boolean; // Not implemented yet

  @Input('isLoading') set setLoading(isLoading: boolean) {
    if (!isLoading && this.embeddedMode && !this.errorMessage && !this.isChangingPaymentMethod) {
      // We have to rescroll because in embeddedMode mode height of iframe is changed when we see finish
      this.pluginEventsService.emitPanelOpened(null, 0);
      this.paymentHelperService.openEmbedFinish$.next(true);
    }
    this.isLoading = isLoading;
  }

  @Input() isChangingPaymentMethod: boolean;
  @Input() errorMessage: string;
  @Input() iframeCallbackUrl: string;
  @Input() embeddedMode = false;
  @Input() isDisableChangePayment: boolean;
  @Input() merchantMode = false;
  @Input() isPaymentAlreadySubmitted = false;
  @Input() isFitContent = false;

  /* @deprecated use isDisableChangePayment instead */
  @Input() set asSinglePayment(asSinglePayment: boolean) {
    this.isDisableChangePayment = asSinglePayment;
  }

  /* @deprecated use isDisableChangePayment instead */
  get asSinglePayment(): boolean {
    return this.isDisableChangePayment;
  }

  @Output() close: EventEmitter<null> = new EventEmitter();

  @ViewChild('contents') contentsTemplate: TemplateRef<any>;
  @ViewChild('finishContainer') finishContainerRef: ElementRef<HTMLDivElement>;

  isLoading = false;
  protected destroyed$: ReplaySubject<boolean> = new ReplaySubject();
  private baseButtons: ModalButtonListInterface;
  protected customElementService = this.injector.get(CustomElementService);
  private finishDialogService: FinishDialogService = this.injector.get(FinishDialogService);
  private pluginEventsService: PluginEventsService = this.injector.get(PluginEventsService);
  private nonFormErrorsService: NonFormErrorsService = this.injector.get(NonFormErrorsService);
  private paymentHelperService: PaymentHelperService = this.injector.get(PaymentHelperService);

  translations = {
    header: $localize `:@@checkout_sdk.finish.header.processing:`,
    details: $localize `:@@checkout_sdk.finish.details.processing:`,
  };

  private resizeObserver: ResizeObserver;

  constructor(private injector: Injector) {
    (window as any).PayeverStatic?.SvgIconsLoader?.loadIcons(
      ['alert-32'],
      null,
      this.customElementService.shadowRoot
    );
  }

  ngAfterViewInit(): void {
    if (this.embeddedMode) {
      this.pluginEventsService.emitPanelOpened(null, 1);
      this.paymentHelperService.openEmbedFinish$.next(true);
    } else {
      this.pluginEventsService.emitModalShow(null);
      this.finishDialogService.open(this.contentsTemplate, this.buttonsAsArray, () => this.onClose());
    }
  }

  ngOnDestroy(): void {
    this.pluginEventsService.emitModalHide(null); // TODO Add real flow id
    this.destroyed$.next(true);
    this.destroyed$.complete();
    !this.embeddedMode && this.finishDialogService.close();
    this.resizeObserver?.disconnect();
  }

  getNonFormErrors(): string[] {
    return this.nonFormErrorsService.getErrorsAsLines();
  }

  onClose(): void {
    this.close.emit();
  }

  onButtonClick(button: ModalButtonInterface): void {
    if (button.click === 'close') {
      this.paymentHelperService.openEmbedFinish$.next(false);
      this.onClose();
    } else if (button.click) {
      button.click();
    }
  }
}
