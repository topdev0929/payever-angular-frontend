import { AddonButtonDecorationType, FieldType, RowType } from '../types';

type ButtonType = 'button' | 'submit';

/**
 * @deprecated Should be removed after migration to fieldset
 */
export interface RowPropertyInterface {
  addonAppend?: string;
  addonAppendBtn?: AddonButtonDecorationType;
  addonPrepend?: string;
  addonPrependBtn?: AddonButtonDecorationType;
  fieldType?: FieldType;
  formWidgetClassName?: string;
  label?: string; // TODO Remove
  required?: boolean;
  requiredTitle?: string;
  rowClassName?: string;
  rowType?: RowType;
  showDefaultLabel?: boolean; // TODO Remove
  showDefaultRequired?: boolean;
}

/**
 * @deprecated Should be removed after migration to fieldset
 */
export interface RowAddonInterface {
  btnType?: ButtonType;
  button?: AddonButtonDecorationType;
  iconId?: string;
  iconSize?: number;
  text?: string;
}
