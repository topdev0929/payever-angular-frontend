import { Component, EventEmitter, Output } from '@angular/core';
import { Moment } from 'moment';

@Component({
  selector: 'pe-grid-datepicker',
  templateUrl: './datepicker.component.html',
  styleUrls: ['./datepicker.component.scss'],
})
export class PeGridDatepickerComponent {

  @Output() closed = new EventEmitter<void>();
  @Output() selectedDate = new EventEmitter<Date>();

  onSelectData(date: Moment): void {
    this.selectedDate.emit(date.toDate());
  }
}
