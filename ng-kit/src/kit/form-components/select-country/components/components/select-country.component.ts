import {
  AfterViewInit,
  Component,
  EventEmitter,
  HostBinding,
  Injector,
  Input, OnInit,
  Output, Renderer2,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { MAT_SELECT_SCROLL_STRATEGY_PROVIDER, MatSelect, MatSelectChange, SELECT_PANEL_MAX_HEIGHT } from '@angular/material/select';
import { CdkConnectedOverlay, OVERLAY_PROVIDERS } from '@angular/cdk/overlay';

import { AbstractFieldComponent } from '../../../../form-core/components/abstract-field';
import { SelectCountryChangeEvent, SelectCountryOptionInterface } from '../../interfaces';
import { AddressService } from '../../../../address/src/services';
import { ContinentArrayInterface, CountryContinentArrayInterface } from '../../../../address/src/interfaces';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { WindowService } from '../../../../window/src/services';
import { BrowserDetectService } from '../../../../browser/src/services';

@Component({
  selector: 'pe-select-country',
  templateUrl: './select-country.component.html',
  encapsulation: ViewEncapsulation.None,
  providers: [
    MAT_SELECT_SCROLL_STRATEGY_PROVIDER,
    OVERLAY_PROVIDERS
  ]
})
export class SelectCountryComponent extends AbstractFieldComponent implements OnInit, AfterViewInit {

  readonly countryTelephoneCodes = require('country-telephone-code/data.json').countryTelephoneCodes;

  @ViewChild(MatSelect, { static: true }) selectComponent: MatSelect;
  @HostBinding('class.pe-select') hostClass: boolean = true;
  @Input()
  set formStyle(formStyle: string) {
    switch (formStyle) {
      case 'dark':
        this.panelClass = 'mat-select-dark';
        break;
      case 'transparent':
        this.panelClass = 'mat-select-transparent';
        break;
      default:
        break;
    }
  }
  @Input() disableOptionCentering: boolean;
  @Input() label: string;
  @Input() multiple: boolean;
  @Input() panelClass: string;
  @Input() placeholder: string;
  @Input() scrollToInitElement: string = 'EU';
  @Input() panelHeight: number;
  @Input() showPhoneCodes: boolean;
  @Input() addPhoneCodeToValue: boolean;

  @Output() openedChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() valueChange: EventEmitter<SelectCountryChangeEvent> = new EventEmitter<SelectCountryChangeEvent>();

  options: SelectCountryOptionInterface[];
  private pPanelHeight: number;
  private pWindowHeight: number;

  get panelClassFormatted(): string {
    return `mat-select-country-panel ${this.panelClass}`;
  }

  constructor(protected injector: Injector,
              private addressService: AddressService,
              private windowService: WindowService,
              private browserDetectService: BrowserDetectService,
              private renderer: Renderer2) {
    super(injector);
  }

  ngOnInit(): void {
    const countryList: CountryContinentArrayInterface[] = this.addressService.countriesContinent;
    this.options = this.addressService.continents.map((continent: ContinentArrayInterface) => {
      const result: SelectCountryOptionInterface = {
        label: continent.name,
        value: continent.code,
        type: 'group',
        items: []
      };
      countryList.filter(country => country.continent === continent.code)
        .forEach((country: CountryContinentArrayInterface) => {
          result.items.push({
                              label: this.getCountryLabel(country),
                              value: this.getCountryValue(country),
                              type: 'option'
                            });
        });
      return result;
    });

    if (this.panelHeight) {
      this.pPanelHeight = this.panelHeight;
      this.windowService.height$.pipe(takeUntil(this.destroyed$))
        .subscribe((windowHeight: number) => {
          this.pWindowHeight = windowHeight;
          if (windowHeight * 0.8 <= this.pPanelHeight) {
            this.pPanelHeight = Math.ceil(windowHeight * 0.8);
          } else {
            this.pPanelHeight = this.panelHeight;
          }
        });
    }
  }

  getCountryLabel(country: CountryContinentArrayInterface): string {
    return this.showPhoneCodes ? `+${this.countryTelephoneCodes[country.code]} ${country.name}` : country.name;
  }

  getCountryValue(country: CountryContinentArrayInterface): string {
    return this.addPhoneCodeToValue ? `${country.code}:+${this.countryTelephoneCodes[country.code]}` : country.code;
  }

  ngAfterViewInit(): void {
    super.ngAfterViewInit();
    this.selectComponent.overlayDir.attach.pipe(
      takeUntil(this.destroyed$),
      debounceTime(1)
    )
      .subscribe(() => {
        if (this.formControl.value === null && this.scrollToInitElement === null) {
          return;
        }

        const panel: HTMLElement = this.selectComponent.panel.nativeElement;
        this.renderer.setStyle(panel, 'max-height', 'unset');
        this._calculateOverlay(this.selectComponent.overlayDir);
        this._scrollToElement(panel);
      });
  }

  onSelectChange(event: MatSelectChange): void {
    this.valueChange.emit({ value: event.value });
  }

  onOpenedChange(opened: boolean): void {
    if (opened) {
      this.markAsUntouched();
    }
    this.openedChange.emit(opened);
  }

  private _calculateOverlay(overlay: CdkConnectedOverlay): void {
    // This function recalculate panel height and scroll, cos standart height 256px and set as constant in mat-select.
    // With this function we wrap calculation and can change not only height, but position also.
    if (this.pPanelHeight && !this.browserDetectService.isIE) {
      // Here, if height input is not null -we change size of panel. But if height in input more than height of window
      // we decrease it to 0.8 of window height.
      const panelHeight: number = this.pPanelHeight;
      const selectBoundSize: ClientRect = this.selectComponent._elementRef.nativeElement.getBoundingClientRect();
      const selectOffsetTop: number = selectBoundSize.bottom;
      const placeAfter: number = this.pWindowHeight - selectOffsetTop;
      const placeBefore: number = this.pWindowHeight - placeAfter;

      this.selectComponent.overlayDir.overlayRef.updateSize({height: `${panelHeight}px`});

      // Here we choose position of panel. If we space up and down - we set panel in middle of selector.
      // In other cases we set it so bottom of panel will be near bottom of selector
      if (placeAfter > panelHeight / 2 && placeBefore > panelHeight / 2) {
        overlay.offsetY = -1 * Math.ceil(panelHeight / 2);
      } else {
        const offsetY: number = panelHeight > selectOffsetTop ? selectOffsetTop : panelHeight;
        overlay.offsetY = -1 * Math.ceil(offsetY - 18);
      }

      overlay.overlayRef.updatePosition();
    }
  }

  private _scrollToElement(panel: HTMLElement): void {
    // Function wich scroll panel content to chosen element or element defined as default.
    // If we have chosen element - we scroll panel content so chosen element must be above center of selector, in other case
    // default element must be on top of panel
    let scrollToId: string = null;
    let isFormValue: boolean = false;

    if (Array.isArray(this.formControl.value)) {
      scrollToId = this.formControl.value.length > 0 ? this.formControl.value[0] : this.scrollToInitElement;
      isFormValue = this.formControl.value.length > 0;
    } else {
      scrollToId = this.formControl.value ? this.formControl.value : this.scrollToInitElement;
      isFormValue = !!this.formControl.value;
    }

    const elementToScroll: any = this.selectComponent.panel.nativeElement.querySelector(`[id="${scrollToId}"]`);
    if (!elementToScroll) {
      return;
    }

    const panelHeight: number = panel.getBoundingClientRect().height;
    const optionHeight: number = panel.querySelector('[role=option]').getBoundingClientRect().height;
    const optionOffset: number = elementToScroll.offsetTop;
    let scrollTo: number = 0;
    if (optionOffset > panelHeight / 2) {
      if (isFormValue) {
        const offsetY: number = this.selectComponent.overlayDir.offsetY;
        scrollTo = optionOffset + offsetY + optionHeight / 2;
      } else {
        scrollTo = optionOffset;
      }
    }
    panel.scrollTop = scrollTo;
  }
}
