import { TimeFormat } from '../enums/clock-type.enum';

import { PebTimeAbstractClass } from './time-abstract.class';

export class PebMinuteClass implements PebTimeAbstractClass {
  minute = 0;
  max = 59;
  min = 0;

  set time(time: number) {
    if (time > this.max) {
      this.minute = this.max;
    } else if (time < this.min) {
      this.minute = this.min;
    } else {
      this.minute = time;
    }
  }

  get time(): number {
    return this.minute;
  }

  timeString(timeFormat?: TimeFormat): string {
    const minute = this.minute.toString();

    return this.minute < 10 && timeFormat === TimeFormat.NullFirst ? `0${this.minute}` : minute;
  }
}
