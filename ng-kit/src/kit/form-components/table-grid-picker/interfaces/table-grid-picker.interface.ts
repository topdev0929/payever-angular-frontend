import { TableGridPickerOptions } from '../enums';
import { TableGridPickerChangeEvent } from '../interfaces';

export interface TableGridPickerInterface {
    selected?: TableGridPickerOptions;
    onValueChange?: (event: TableGridPickerChangeEvent) => void;
}
