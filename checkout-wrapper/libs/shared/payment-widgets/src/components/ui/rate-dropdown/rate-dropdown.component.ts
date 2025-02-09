import { coerceCssPixelValue } from '@angular/cdk/coercion';
import {
  Component, ChangeDetectionStrategy, ElementRef, Injector, Input,
  Output, EventEmitter, ViewChild, HostListener, OnDestroy,
} from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { timer } from 'rxjs';

import { RateInterface, SelectedRateMultiTitle } from '@pe/checkout/types';

import { WidgetScaleService } from '../../../services';
import { UIBaseComponent } from '../base.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'finexp-ui-rate-dropdown',
  templateUrl: './rate-dropdown.component.html',
  styleUrls: ['./rate-dropdown.component.scss'],
})
export class UIRateDropdownComponent extends UIBaseComponent implements OnDestroy {

  @Input() isLoading = false;
  @Input() error: string = null;
  rates: RateInterface[] = [];
  @Input('rates') set setRates(rates: RateInterface[]){
    this.rates = rates;
    this.checkDefaultRate();
  }

  @Input() useMultiTitle = false;
  @Input() isShowSelectedRateDetails = true;
  @Input() numColumns = 2;

  @Input() rate: RateInterface;

  @Output('rateSelected') rateSelectedEmitter: EventEmitter<RateInterface> = new EventEmitter();

  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;

  readonly sheetId: string = 'pe-widget-rate-drop-down-menu-sheet';
  readonly dropdownIconWidth: number = 56;
  readonly fontSize: number = 16;

  dropdownWidth: number = null;
  mainTextColor: string = null;
  fieldBackgroundColor: string = null;
  fieldLineColor: string = null;
  fieldArrowColor: string = null;

  constructor(
    injector: Injector,
    protected element: ElementRef,
    private widgetScaleService: WidgetScaleService,
  ) {
    super(injector);
  }

  get selectedRate(): RateInterface {
    return this.rates?.length ? (this.rate || this.rates[0]) : null;
  }

  get selectedRateMultiTitles(): SelectedRateMultiTitle[] {
    return this.rates?.length ? this.selectedRate?.selectedMultiTitles : null;
  }

  @HostListener('document:keydown.escape', ['$event'])
  onKeydownHandler(event: KeyboardEvent): void {
    this.trigger.closeMenu();
  }

  onTitleResized({ target }: ResizeObserverEntry) {
    this.dropdownWidth = target.clientWidth + this.dropdownIconWidth;
  }

  onOpened(): void {
    this.removeStyleSheet(0); // to prevent multiple insertions
    this.addStyleSheet();
  }

  onClosed(): void {
    this.removeStyleSheet();
  }

  selectRate(selected: RateInterface): void {
    this.rate = selected;
    this.rateSelectedEmitter.emit(selected);
  }

  onUpdateStyles(): void {
    this.mainTextColor = this.currentStyles?.mainTextColor || this.default.styles.mainTextColor;
    this.fieldBackgroundColor = this.currentStyles?.fieldBackgroundColor || this.default.styles.fieldBackgroundColor;
    this.fieldLineColor = this.currentStyles?.fieldLineColor || this.default.styles.fieldLineColor;
    this.fieldArrowColor = this.currentStyles?.fieldArrowColor || this.default.styles.fieldArrowColor;
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();

    this.onClosed();
  }

  private addStyleSheet(): void {
    const sheet = document.createElement('style');
    sheet.id = this.sheetId;
    sheet.innerHTML = `
      .pe-widget-rate-drop-down-menu+* .cdk-overlay-pane > div.mat-menu-panel {
        width: ${(this.dropdownWidth - 2) * this.widgetScaleService.scale}px !important;
        --scale: ${this.widgetScaleService.scale};
      }
      .pe-widget-rate-drop-down-menu + * .cdk-overlay-pane > div.mat-menu-panel .mat-menu-content:not(:empty) {
        padding-top: ${coerceCssPixelValue(8 * this.widgetScaleService.scale)};
        padding-bottom: ${coerceCssPixelValue(8 * this.widgetScaleService.scale)};
      }
    `;

    this._rootNode().appendChild(sheet);
  }

  private removeStyleSheet(dueTime = 800): void {
    const sheetToBeRemoved = this._rootNode().querySelector(`#${this.sheetId}`);
    if (sheetToBeRemoved) {
      timer(dueTime).subscribe(() => {
        // We have to add delay because close animation takes some time and during that animation we have wrong width

        this._rootNode()?.contains(sheetToBeRemoved) && this._rootNode().removeChild(sheetToBeRemoved);
      });
    }
  }

  private checkDefaultRate(): void {
    const defaultRate = this.rates?.find(rate => rate?.isDefault);
    defaultRate && this.selectRate(defaultRate);
  }

  private _rootNode(): Element {
    return document.body;
  }
}
