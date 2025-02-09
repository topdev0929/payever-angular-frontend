import { coerceCssPixelValue } from '@angular/cdk/coercion';
import { Overlay } from '@angular/cdk/overlay';
import {
  Component, ChangeDetectionStrategy, Injector, Input,
  Output, EventEmitter, ViewChild, TemplateRef, Inject, ElementRef, Renderer2,
} from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Subscription, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { PE_ENV, EnvironmentConfigInterface as EnvInterface } from '@pe/common';

import { WidgetScaleService } from '../../../services';
import { UIBaseComponent } from '../base.component';

import { CARD_PADDING, MIN_SCALE_WIDTH, NORMAL_WIDTH } from './constant';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'finexp-ui-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
})
export class UICardComponent extends UIBaseComponent {

  asModal = false;
  isRefreshing = false;
  dialogOpenSubscription: Subscription;

  @Input('asModal') set setAsModal(asModal: boolean) {
    this.asModal = asModal;
    if (this.asModal) {
      this.widgetScaleService.setDefault();
      this.dialogRef = this.dialog.open(this.modalContentTemplate, {
        panelClass: 'pe-widget-card-modal',
        scrollStrategy: this.overlay.scrollStrategies.noop(),
      });
      this.dialogRef.afterClosed().pipe(takeUntil(this.destroyed$)).subscribe(() => {
        if (this.dialogRef) {
          this.dialogRef = null;
          this.modalClosedEmitter.emit();
        }
      });
    } else {
      this.close();
    }
  }

  @Output('modalClosed') modalClosedEmitter: EventEmitter<void> = new EventEmitter();

  @ViewChild('modalContentTemplate') modalContentTemplate: TemplateRef<any>;
  @ViewChild('peWidgetCard', { static: false }) peWidgetCardRef: ElementRef<HTMLDivElement>;
  @ViewChild('wrapperContent') wrapperContentRef: ElementRef<HTMLDivElement>;

  minWidth: number = null;
  maxWidth: number = null;
  borderColor: string = null;
  backgroundColor: string = null;

  private dialogRef: MatDialogRef<any> = null;
  private readonly bordersWidth = 4;

  constructor(
    injector: Injector,
    public dialog: MatDialog,
    private overlay: Overlay,
    private domSanitizer: DomSanitizer,
    private matIconRegistry: MatIconRegistry,
    private renderer: Renderer2,
    private widgetScaleService: WidgetScaleService,
    @Inject(PE_ENV) private env: EnvInterface,
  ) {
    super(injector);

    this.matIconRegistry.addSvgIcon(
      'close-16',
      this.domSanitizer.bypassSecurityTrustResourceUrl(`${this.env.custom.cdn}/payment-widgets/icons/close-16.svg`),
    );
  }

  close(e?: Event): void {
    if (this.dialogRef) {
      this.dialogOpenSubscription?.unsubscribe();
      this.dialogRef?.close();
      // At some sites animation is broken and
      // Material Dialog stays on page and this.dialogRef.afterClosed() not triggered.
      //  So we have to add some logic:
      timer(200).pipe(takeUntil(this.destroyed$)).subscribe(() => {
        if (this.dialogRef) {
          // Have to force use custom close modal mechanism for widget. Seems that animations are broken at site.');
          const openedDialog: any = this.dialog.getDialogById(this.dialogRef.id);
          const parent = ((openedDialog._overlayRef?._host as HTMLDivElement)?.parentNode as HTMLDivElement);

          if (parent?.innerHTML) {
            parent.innerHTML = '';
          }

          if (document.head?.parentElement?.classList?.contains('cdk-global-scrollblock')) {
            document.head.parentElement.classList.remove('cdk-global-scrollblock');
          }

          openedDialog.close();

          this.dialogRef = null;
          this.modalClosedEmitter.emit();

          this.isRefreshing = true;
          this.cdr.detectChanges();
          timer(10).pipe(takeUntil(this.destroyed$)).subscribe(() => {
            this.isRefreshing = false;
            this.cdr.detectChanges();
          });
        }
      });
    }
  }

  onUpdateStyles(): void {
    this.minWidth = Number(this.config?.minWidth) || Number(this.default.minWidth);
    this.maxWidth = Number(this.config?.maxWidth) || Number(this.default.maxWidth);
    if (this.minWidth < this.config.minWidth) {
      this.minWidth = this.config.minWidth;
    }
    if (this.maxWidth < this.minWidth && this.maxWidth > 0) {
      this.maxWidth = this.minWidth;
    }
    this.borderColor = this.currentStyles?.lineColor || this.default.styles.lineColor;
    this.backgroundColor = this.currentStyles?.backgroundColor || this.default.styles.backgroundColor;
    this.cdr.markForCheck();
  }

  onResize({ target }: ResizeObserverEntry): void {
    this.calcDimensions(target as HTMLDivElement);
  }

  onContentResize({ target }: ResizeObserverEntry): void {
    this.updateWrapperHeight(target as HTMLDivElement);
  }

  calcDimensions(element: HTMLDivElement): void {
    const newWidth = Math.min(Math.max(MIN_SCALE_WIDTH, element.offsetWidth), NORMAL_WIDTH);
    let cardPadding = CARD_PADDING;
    const wrapperContentRef = this.wrapperContentRef?.nativeElement;

    this.widgetScaleService.setDefault();

    if (newWidth !== NORMAL_WIDTH) {
      cardPadding = this.calcPadding(newWidth);
      this.widgetScaleService.scale = (newWidth + this.bordersWidth) / NORMAL_WIDTH;
    }

    const paddingPx = coerceCssPixelValue(cardPadding);

    this.renderer.setStyle(wrapperContentRef, 'transform', this.widgetScaleService.scaleInCssValue);
    this.renderer.setStyle(wrapperContentRef, 'padding', `8px ${paddingPx}`);

    this.updateWrapperWidth(element, this.wrapperContentRef?.nativeElement);
    this.updateWrapperHeight(this.wrapperContentRef?.nativeElement);
  }

  private calcPadding(newWidth: number): number {
    const cardPadding = CARD_PADDING * (newWidth / NORMAL_WIDTH);

    return Math.min(cardPadding, CARD_PADDING);
  }

  private updateWrapperWidth(element: HTMLDivElement, wrapperContentRef: HTMLDivElement) {
    let wrapperWidth = element.offsetWidth <= NORMAL_WIDTH ? NORMAL_WIDTH : this.maxWidth;
    const newWidth = Math.min(Math.max(this.config.minWidth, element.offsetWidth), NORMAL_WIDTH);
    const scale = (newWidth + this.bordersWidth) / NORMAL_WIDTH;

    if (element.offsetWidth <= MIN_SCALE_WIDTH) {
      wrapperWidth = (wrapperWidth * scale) / this.widgetScaleService.scale;
    }

    this.peWidgetCardRef && this.renderer.setStyle(
      wrapperContentRef,
      'width',
      `${coerceCssPixelValue(wrapperWidth - CARD_PADDING * 2)}`
    );
  }

  private updateWrapperHeight(wrapperEl: HTMLDivElement) {
    const maxHeight = wrapperEl.offsetHeight * this.widgetScaleService.scale;
    this.peWidgetCardRef && this.renderer.setStyle(
      this.peWidgetCardRef?.nativeElement,
      'height',
      `${coerceCssPixelValue(maxHeight)}`
    );
  }
}
