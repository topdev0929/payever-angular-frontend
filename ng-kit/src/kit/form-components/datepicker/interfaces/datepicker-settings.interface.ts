import { DatepickerMode, DatepickerStartView } from '../enums';
import { DatepickerChangeEvent } from './datepicker-change-event.interface';

export interface DatepickerSettingsInterface {
  max?: Date | null;
  min?: Date | null;
  mode?: DatepickerMode;
  placeholder?: string;
  startAt?: Date | null;
  startView?: DatepickerStartView;
  touchUi?: boolean;
  filter?(date: Date | null): boolean;
  onValueChange?(event: DatepickerChangeEvent): void;
  onFocus?(event: FocusEvent): void;
  onBlur?(event: FocusEvent): void;
}
