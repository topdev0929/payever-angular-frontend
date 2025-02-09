import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { MatCalendar } from '@angular/material/datepicker';
import { MatDialogRef } from '@angular/material/dialog';

import { Moment } from 'moment';
import * as moment_ from 'moment';
const moment = moment_;

@Component({
  selector: 'pe-coupons-datepicker',
  templateUrl: './coupons-datepicker.component.html',
  styleUrls: ['./coupons-datepicker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeCouponsDatepickerComponent implements AfterViewInit {

  @ViewChild('calendar') calendar: MatCalendar<Moment>;
  @ViewChild('wrapper') wrapper: ElementRef;

  readonly minDate = moment();

  constructor(
    private dialogRef: MatDialogRef<PeCouponsDatepickerComponent>,
    private renderer: Renderer2
  ) { }

  ngAfterViewInit() {
    const calendar = this.wrapper.nativeElement.children[0];

    this.renderer.removeClass(calendar, 'mat-calendar');
  }

  selectedChangeOn(date: Moment): void {
    this.dialogRef.close(date);
  }
}