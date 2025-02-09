import { AfterViewInit, Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { MatCalendar } from '@angular/material/datepicker';
import { MatDialogRef } from '@angular/material/dialog';
import { Moment } from 'moment';


@Component({
  selector: 'pe-rule-datepicker',
  templateUrl: './rule-datepicker.html',
  styleUrls: ['./rule-datepicker.scss'],
})

export class RuleDatePickerComponent implements AfterViewInit {
  @ViewChild('calendar') calendar: MatCalendar<Moment>;
  @ViewChild('wrapper') wrapper: ElementRef;

  readonly minDate = new Date();

  constructor(
    private dialogRef: MatDialogRef<RuleDatePickerComponent>,
    private renderer: Renderer2,
  ) { }

  ngAfterViewInit(): void {
    const calendar = this.wrapper.nativeElement.children[0];
    this.renderer.removeClass(calendar, 'mat-calendar');
  }

  selectedChangeOn(date: Moment): void {
    this.dialogRef.close(date);

  }
}
