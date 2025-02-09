import { Observable } from 'rxjs';

import { TooltipPosition } from '../../tooltip/src/types';
import { AddonInterface } from '../components/addon';
import { LinkedControlInterface } from './linked-control.interface';
import { FieldSettingsInterface } from './field-settings.interface';
import { InputSettingsInterface } from './input-settings.interface';

export interface TooltipIconInterface {
  tooltipMessage: string;
  tooltipPosition?: TooltipPosition;
}

export interface BaseFormSchemeFieldsets<TFormSchemeField extends BaseFormSchemeField> {
  [key: string]: TFormSchemeField[];
}

export interface BaseFormScheme<TFormSchemeField extends BaseFormSchemeField> {
  fieldsets: BaseFormSchemeFieldsets<TFormSchemeField>;
}

export interface BaseFormSchemeField {
  name: string;
  // type: FormSchemeFieldType; // Must be declared in extended interface
  fieldSettings?: FieldSettingsInterface | Observable<FieldSettingsInterface>;
  inputSettings?: InputSettingsInterface | Observable<InputSettingsInterface>;
  linkedControls?: LinkedControlInterface[] | Observable<LinkedControlInterface[]>;

  tooltipIcon?: TooltipIconInterface | Observable<TooltipIconInterface>;
  addonAppend?: AddonInterface | Observable<AddonInterface>;
  addonPrepend?: AddonInterface | Observable<AddonInterface>;
}
