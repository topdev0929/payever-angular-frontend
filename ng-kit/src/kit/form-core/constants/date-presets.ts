import { parseZone } from 'moment';

export interface DatePresetInterface {
  min: Date;
  max: Date;
}

export class DatePresets {

  static default: DatePresetInterface = {
    min: parseZone().subtract(100, 'years').toDate(),
    max: parseZone().add(100, 'years').toDate()
  };

  static future: DatePresetInterface = {
    min: parseZone().add(1, 'days').toDate(),
    max: parseZone().add(50, 'years').toDate()
  };

  static past: DatePresetInterface = {
    min: parseZone().subtract(100, 'years').toDate(),
    max: parseZone().subtract(1, 'days').toDate()
  };

  static adultDateOfBirth: DatePresetInterface = {
    min: parseZone().subtract(100, 'years').toDate(),
    max: parseZone().subtract(18, 'years').toDate()
  };

  static santanderAdultDateOfBirth: DatePresetInterface = {
    // Sometimes limit is 65 but we keep this validation only at BE
    min: parseZone().subtract(70, 'years').toDate(),
    max: parseZone().subtract(18, 'years').toDate()
  };

}
