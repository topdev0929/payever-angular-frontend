import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  Inject,
  Input,
  OnChanges,
  Optional,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MatDatepicker } from '@angular/material/datepicker';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { parseZone } from "moment/moment";
import { timer } from 'rxjs';
import { filter, take, takeUntil, tap } from 'rxjs/operators';

import { AppType, APP_TYPE, PeDestroyService, PreloaderState } from '@pe/common';
import { PeFilterChange, PeFilterType } from '@pe/grid/shared';
import { LocaleService, TranslateService } from '@pe/i18n-core';
import { SnackbarService } from '@pe/snackbar';
import { PebTimePickerService, PeDateTimePickerService } from '@pe/ui';

import { PeGridMenuService } from '../../menu';
import { PeGridMenuPosition } from '../../misc/enums';
import {
  PeFilterKeyInterface,
  PeGridMenu,
  PeGridMenuConfig,
} from '../../misc/interfaces';
import { PeGridToolbarService } from '../toolbar.service';

@Component({
  selector: 'pe-toolbar-filter',
  templateUrl: './filter-form.component.html',
  styleUrls: ['./filter-form.component.scss'],
  providers: [PeDestroyService],
})
export class PeGridToolbarFilterComponent implements OnChanges {
  @SelectSnapshot(PreloaderState.loading) loading: {};

  @Input() filterConfig: PeFilterKeyInterface[];
  @Input() mobileView = false;

  @Output() addedFilter = new EventEmitter<PeFilterChange>();

  readonly PeFilterType = PeFilterType;

  keysRef: ElementRef;
  @ViewChild('keysRef', { static: false }) set filterElementRef(content: ElementRef) {
    if (content) {
      this.keysRef = content;
      this.resetFilters();
    }
  }

  conditionsRef: ElementRef;
  @ViewChild('conditionsRef', { static: false }) set containsElementRef(content: ElementRef) {
    if (content) {
      this.conditionsRef = content;
      this.resetContains();
    }
  }

  valuesRef: ElementRef;
  @ViewChild('valuesRef', { static: false }) set valuesElementRef(content: ElementRef) {
    if (content) {
      this.valuesRef = content;
      this.resetValues();
    }
  }

  valuesRefFrom: ElementRef;
  @ViewChild('valuesRefFrom', { static: false }) set valuesElementRefFrom(content: ElementRef) {
    if (content) {
      this.valuesRefFrom = content;
      this.resetValues();
    }
  }

  valuesRefTo: ElementRef;
  @ViewChild('valuesRefTo', { static: false }) set valuesElementRefTo(content: ElementRef) {
    if (content) {
      this.valuesRefTo = content;
      this.resetValues();
    }
  }

  @ViewChild('picker', { static: false }) picker: MatDatepicker<any>;

  get valueIsBetween(): boolean {
    return this.toolbarService.isValueBetween(this.searchItem.contain);
  }

  get isDisabled(): boolean {
    return !this.filterForm.get('condition')?.value || this.filterForm.get('value')?.disabled;
  }

  get readOnly(): boolean {
    return this.valueType === PeFilterType.Option
      || this.valueType === PeFilterType.Date
      || this.valueType === PeFilterType.Time;
  }

  get valueType(): PeFilterType {
    return this.toolbarService.getValueType(this.searchItem.filter, this.filterConfig);
  }

  get placeholder(): string {
    switch (this.valueType) {
      case PeFilterType.Date:
        return this.getLabel('select_date');
      case PeFilterType.Option:
        return this.getLabel('select');
      case PeFilterType.Time:
        return this.getLabel('select_time');
      default:
        return this.getLabel('search');
    }
  }

  get isSearch(): boolean {
    return this.valueType === PeFilterType.Number || this.valueType === PeFilterType.String;
  }

  filterForm: FormGroup;
  locale = this.localeService.currentLocale$.value.code;
  hasError = false

  @HostBinding('class.mobile-view') get isMobileView() {
    return this.mobileView;
  }

  public readonly maskFn = (input: string) => {
    if (this.valueType !== PeFilterType.Number) {
      return input;
    }

    return input?.replace(/\D/g, '');
  }


  private BetweenBoundaryValidator = (formGroup: AbstractControl): ValidationErrors => {
    const valueFromControl = formGroup.get('valueFrom');
    const valueToControl = formGroup.get('valueTo');
    if (
      !valueToControl.valid
      || !valueToControl.value
      || !valueFromControl.value
      || !valueFromControl.valid
    ) {
      return null;
    }

    const valueFrom = this.parseFormValue(valueFromControl.value);
    const valueTo = this.parseFormValue(valueToControl.value);

    if (valueFrom > valueTo) {
      return {
        boundary: this.translateService.hasTranslation('grid.toolbar.errors.invalid_range')
          ? 'grid.toolbar.errors.invalid_range'
          : 'Invalid range, "from" must be less than "to".',
      };
    }

    return null;
  };

  constructor(
    private formBuilder: FormBuilder,
    private timePicker: PebTimePickerService,
    private peGridMenuService: PeGridMenuService,
    private dateTimePicker: PeDateTimePickerService,
    private translateService: TranslateService,
    private cdr: ChangeDetectorRef,
    private destroy$: PeDestroyService,
    private localeService: LocaleService,
    public toolbarService: PeGridToolbarService,
    private snackbarService: SnackbarService,
    @Optional() @Inject(APP_TYPE) private appType: AppType,
  ) {
    this.filterForm = this.formBuilder.group({
      key: [null, [Validators.required]],
      containsTranslations: [false],
      condition: [null, [Validators.required]],
      value: [null, [Validators.required]],
      valueFrom: [null, [Validators.required]],
      valueTo: [null, [Validators.required]],
    },
      {
        validators: [this.BetweenBoundaryValidator],
      }
    );
    this.filterForm.statusChanges.pipe(
      tap(() => {
        const errors = this.filterForm.errors || {};

        if (!errors?.boundary) {
          // we show error on submit and remove it immediately
          this.hasError = false;
          this.cdr.detectChanges();
        }
      }),
      takeUntil(this.destroy$)
    ).subscribe();

  }

  get isGlobalLoading(): boolean {
    return !this.appType ? false : this.loading[this.appType];
  }

  get searchItem(): PeFilterChange {
    const fv = this.filterForm.value;

    return {
      filter: fv.key,
      contain: fv.condition,
      search: this.toolbarService.isValueBetween(fv.condition) ? { from: fv.valueFrom, to: fv.valueTo } : fv.value?.trim(),
    };
  }

  ngOnChanges(changes: SimpleChanges): void {
    const { filterConfig } = changes;
    if (filterConfig?.currentValue && this.keysRef && this.conditionsRef) {
      this.resetFilters();
      this.resetContains();
    }
  }

  getLabel(key: string): string {
    return this.translateService.translate(`grid.labels.${key}`);
  }

  keyPress(event: KeyboardEvent, valueFieldName: string): void {
    if (event) {
      timer(0).pipe(takeUntil(this.destroy$)).subscribe(() => {
        // Have to use timer to have latest added character
        if (this.valueType === PeFilterType.String || this.valueType === PeFilterType.Number) {
          const value = (event.target as HTMLInputElement).value;
          // replace ZeroWidthSpace
          this.filterForm.get(valueFieldName).setValue(value?.replace(/\p{Cf}+/gu,''));
        }
        if (event?.key === 'Enter' || event?.keyCode === 13) {
          this.addFilter();
        }
      });
    }
  }

  getMenuConfig(offsetX = 0, offsetY = 0, position: PeGridMenuPosition, minWidth?: number): PeGridMenuConfig {
    const config: PeGridMenuConfig = {
      offsetX,
      offsetY,
      position,
    };

    return minWidth ? { minWidth, ...config } : config;
  }

  getOverlayConfig(clientWidth: number): PeGridMenuConfig {
    const offsetY = window.innerWidth <= 720 ? 0 : 12;

    return this.getMenuConfig(0, offsetY, PeGridMenuPosition.LeftBottom, clientWidth);
  }

  openOverlay(elem: EventTarget, menu: PeGridMenu, control: string): void {
    if (!this.filterConfig?.length || menu.items.length < 2) {
      return;
    }

    const element: HTMLInputElement = elem as any;
    this.peGridMenuService.open(element, menu, this.getOverlayConfig(element.clientWidth));

    this.peGridMenuService.overlayClosed$.pipe(
      take(1),
      filter(data => !!data),
      tap((data) => {
        this.filterForm.get(control).setValue(data.value);
        element.value = data.label;

        if (control === 'key') {
          this.filterForm.get('containsTranslations').setValue(data.containsTranslations);
          this.resetContains(data.value);
          this.resetValues();
        }
        this.checkIsBetween();
        if (['value', 'valueFrom', 'valueTo'].indexOf(control) >= 0) {
          this.addFilter();
        }

        this.cdr.detectChanges();
      })
    ).subscribe();
  }

  checkIsBetween() {
    if (this.valueIsBetween) {
      this.filterForm.get('value').disable();
      this.filterForm.get('valueFrom').enable();
      this.filterForm.get('valueFrom').setValidators(Validators.required);
      this.filterForm.get('valueTo').enable();
      this.filterForm.get('valueTo').setValidators(Validators.required);
    } else {
      this.filterForm.get('value').enable();
      this.filterForm.get('valueFrom').disable();
      this.filterForm.get('valueFrom').clearAsyncValidators();
      this.filterForm.get('valueTo').disable();
      this.filterForm.get('valueTo').clearAsyncValidators();
    }
  }

  openValueOverlay(event: MouseEvent, valueFieldName: string): void {
    const element: HTMLInputElement = event.target as any;

    switch (this.valueType) {
      case PeFilterType.Option:
        this.openOverlay(element, this.toolbarService.getValueOptions(this.searchItem.filter, this.filterConfig), 'value');
        break;
      case PeFilterType.Date:
        this.dateOverlay(event, element, valueFieldName);
        break;
      case PeFilterType.Time:
        this.timeOverlay(event, element, valueFieldName);
        break;
    }
  }

  dateOverlay(event: MouseEvent, element: HTMLInputElement, valueFieldName: string): void {
    const valueFrom = this.filterForm.get('valueFrom').value;
    const valueTo = this.filterForm.get('valueTo').value;
    const fromDate = valueFrom ? new Date(valueFrom) : null;
    const toDate = valueTo ? new Date(valueTo) : null;

    const isDateFrom = this.valueIsBetween && valueFieldName === 'valueFrom';
    const isDateTo = this.valueIsBetween && valueFieldName === 'valueTo';

    const dialogRef = this.dateTimePicker.open(event, {
      position: {
        originX: 'start',
        originY: 'bottom',
        overlayX: 'start',
        overlayY: 'top',
        offsetX: -12,
        offsetY: 12,
      },
      config: {
        headerTitle: 'Date',
        range: false,
        format: 'YYYY-MM-DD',
        maxDate: isDateFrom ? toDate : null,
        minDate: isDateTo ? fromDate : null,
      },
    });

    dialogRef.afterClosed.pipe(
      take(1),
      filter(data => !!data.start),
      tap((data) => {
        const date = new Date(data.start);
        this.filterForm.get(valueFieldName).setValue(this.fixDate(date));
        element.value = this.toolbarService.formatDate(date.toUTCString());
        this.addFilter();
        this.cdr.detectChanges();
      }),
    ).subscribe();
  }

  timeOverlay(event: MouseEvent, element: HTMLInputElement, valueFieldName: string): void {
    const dialogRef = this.timePicker.open(event, {
      position: {
        originX: 'start',
        originY: 'bottom',
        overlayX: 'start',
        overlayY: 'top',
        offsetX: -12,
        offsetY: 12,
      },
      timeConfig: { animation: 'fade' },
    });

    dialogRef.afterClosed.pipe(
      take(1),
      filter(time => !!time),
      tap((time) => {
        this.filterForm.get(valueFieldName).setValue(time);
        element.value = time;
        this.addFilter();
        this.cdr.detectChanges();
      }),
    ).subscribe();
  }

  public addFilter(): void {
    if (!this.filterForm.valid) {
      const errors = this.filterForm.errors;
      if (!errors) {
        return;
      }

      const [key, error] = Object.entries(errors)?.slice(0, 1)?.[0] || [];
      if (key === 'boundary') {
        this.showError(error);
        this.hasError = true;
        this.cdr.detectChanges();
      }

      return;
    }
    const fv = this.filterForm.value;
    const key = fv.containsTranslations ? `${fv.key}.${this.locale}` : fv.key;
    const filter = this.searchItem;
    filter.filter = key;
    this.addedFilter.emit(filter);
    this.resetForm();
  }

  private showError(message: string) {
    this.snackbarService.toggle(true, {
      content: this.translateService.translate(message),
      iconId: 'icon-x-rounded-16',
      duration: 3_000,
      iconColor: '#EB4653',
    });
  }

  private parseFormValue(value: string) {
    switch (this.valueType) {
      case PeFilterType.Number:
        return Number(value);
      case PeFilterType.Time:
      case PeFilterType.Date:
        return new Date(value);
      default:
        return value;
    }
  }

  private resetForm(): void {
    this.filterForm.reset();
    this.resetFilters();
    this.resetContains();
    this.resetValues();
  }

  private resetFilters(): void {
    if (this.filterConfig?.length) {
      const filter: PeFilterKeyInterface = this.filterConfig[0];
      this.filterForm.get('key').setValue(filter.fieldName);
      this.filterForm.get('containsTranslations').setValue(filter.containsTranslations);
      this.keysRef.nativeElement.value = this.toolbarService.getFilterKeyFormatted(this.searchItem, this.filterConfig);
      this.checkIsBetween();
    } else {
      this.filterForm.get('key').setValue(null);
      this.keysRef.nativeElement.value = '';
    }
    this.cdr.detectChanges();
  }

  private resetContains(key = null): void {
    if (this.filterConfig?.length) {
      const filter: PeFilterKeyInterface = this.filterConfig.find(item => item.fieldName === key) ?? this.filterConfig[0];
      this.filterForm.get('condition').setValue(filter.filterConditions[0]);
      this.conditionsRef.nativeElement.value =
        this.toolbarService.getFilterConditionFormatted(this.searchItem, this.filterConfig);
    } else {
      this.filterForm.get('condition').setValue(null);
      this.conditionsRef.nativeElement.value = '';
    }
    this.cdr.detectChanges();
  }

  private resetValues(): void {
    this.filterForm.get('value').setValue(null);
    this.filterForm.get('valueFrom').setValue(null);
    this.filterForm.get('valueTo').setValue(null);
    if (this.valuesRef) { this.valuesRef.nativeElement.value = ''; }
    if (this.valuesRefFrom) { this.valuesRefFrom.nativeElement.value = ''; }
    if (this.valuesRefTo) { this.valuesRefTo.nativeElement.value = ''; }
  }

  private fixDate(date: Date): string {
    return parseZone(date)
      .set({ hour: 0, minute: 0, second: 0 })
      .toISOString(true)
      .replace(/.000/gi, '');
  }
}
