import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewEncapsulation,
  ViewChild,
  Inject,
  Injector,
  OnInit,
  HostBinding,
  ElementRef,
  NgZone
} from '@angular/core';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDatepickerInputEvent, MatDatepicker } from '@angular/material/datepicker';
import { Platform } from '@angular/cdk/platform';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

import { LocaleConstantsService } from '../../../../i18n';
import { AbstractFieldComponent } from '../../../../form-core/components/abstract-field';
import { DATE_FORMATS } from '../../constants';
import { LocaleDateAdapter } from '../../../../form-core/date-adapters';
import { DatepickerStartView, DatepickerMode } from '../../enums';
import { DatepickerChangeEvent } from '../../interfaces';
import { TransformDateService } from '../../../../form-core/services';
import { WindowService } from '../../../../window/src/services';

@Component({
  selector: 'pe-datepicker',
  templateUrl: 'datepicker.component.html',
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: DateAdapter,
      useClass: LocaleDateAdapter,
      deps: [Platform, TransformDateService],
    },
    {
      provide: MAT_DATE_FORMATS,
      useValue: DATE_FORMATS
    }
  ]
})
export class DatepickerComponent extends AbstractFieldComponent implements OnInit {

  @HostBinding('class.pe-datepicker') hostClass: boolean = true;

  @Input() filter: (date: Date | null) => boolean;
  @Input() max: Date | null;
  @Input() min: Date | null;
  @Input('mode') set setMode(datepickerMode: DatepickerMode) {
    this.mode = datepickerMode;
    this.updateDateFormat();
  }
  @Input() placeholder: string;
  @Input() startAt: Date | null;
  @Input() startView: DatepickerStartView = DatepickerStartView.Month;
  @Input() touchUi: boolean = false;
  @Input() panelClass: string;

  @Output() valueChange: EventEmitter<DatepickerChangeEvent> = new EventEmitter<DatepickerChangeEvent>();

  @ViewChild('datepicker') datepicker: MatDatepicker<Date>;
  @ViewChild('input') input: ElementRef<HTMLInputElement>;

  mode: DatepickerMode = DatepickerMode.Date;
  modes: typeof DatepickerMode = DatepickerMode;
  windowHeightSubscribe$: Subscription;

  constructor(private dateAdapter: DateAdapter<Date>,
              protected injector: Injector,
              private ngZone: NgZone,
              private windowService: WindowService,
              private localeConstantsService: LocaleConstantsService
  ) {
    super(injector);
    if (this.lang) {
      this.dateAdapter.setLocale(this.lang);
    }
  }

  private get dateFormatShortMoment(): string {
    return this.localeConstantsService.getDateFormatShortMoment();
  }

  private get dateMonthFormatShortMoment(): string {
    return this.localeConstantsService.getDateMonthFormatShortMoment();
  }

  private get lang(): string {
    return this.localeConstantsService.getLang();
  }

  ngOnInit(): void {
    this.startView = this.startView || DatepickerStartView.Month;
    this.mode = this.mode || DatepickerMode.Date;
    this.updateDateFormat();
  }

  // Datepicker functionality

  onClosed(): void {
    if (this.windowHeightSubscribe$) {
      this.windowHeightSubscribe$.unsubscribe();
    }
  }

  onDateChanged(event: MatDatepickerInputEvent<Date>): void {
    this.valueChange.emit({ value: event.value });

    // When focus is lost and value is not possible to parse into date
    if (!event.value) {
      if (this.input.nativeElement.value) {
        this.formControl.setErrors({
          pattern: {
            valid: false
          }
        });
      } else {
        this.formControl.updateValueAndValidity();
      }
    }
  }

  chosenYearHandler(year: Date): void {
    if (this.mode === DatepickerMode.MonthYear) {
      let ctrlValue: Date = this.formControl.value;
      if (!ctrlValue) {
        ctrlValue = new Date(year.getFullYear(), 0);
      } else {
        ctrlValue.setFullYear(year.getFullYear());
      }
      this.formControl.setValue(ctrlValue);
      this.valueChange.emit({ value: ctrlValue });
    }
  }

  chosenMonthHandler(month: Date): void {
    if (this.mode === DatepickerMode.MonthYear) {
      const ctrlValue: Date = this.formControl.value;
      ctrlValue.setMonth(month.getMonth());
      this.formControl.setValue(ctrlValue);
      this.valueChange.emit({ value: ctrlValue });
      this.datepicker.close();
    }
  }

  private updateDateFormat(): void {
    if (this.dateAdapter instanceof LocaleDateAdapter) {
      let dateFormat: string = this.dateFormatShortMoment;
      if (this.mode === DatepickerMode.MonthYear) {
        dateFormat = this.dateMonthFormatShortMoment;
      }
      else if (this.mode === DatepickerMode.Week) {
        dateFormat = 'WW.YYYY';
      }
      if (dateFormat) {
        this.dateAdapter.dateFormat = dateFormat;
      }
    }
  }
}
