import { Component, Injector, Output, EventEmitter, ViewEncapsulation } from '@angular/core';

import { AbstractFieldComponent } from '../../../form-core/components/abstract-field';
import { TableGridPickerOptions } from '../enums';
import { TableGridPickerChangeEvent } from '../interfaces';

@Component({
    selector: 'pe-table-grid-picker',
    templateUrl: 'table-grid-picker.component.html',
    encapsulation: ViewEncapsulation.None
})
export class TableGridPickerComponent extends AbstractFieldComponent {

    @Output() valueChange: EventEmitter<TableGridPickerChangeEvent> = new EventEmitter<TableGridPickerChangeEvent>();

    allGridOptions: TableGridPickerOptions[] = Object.keys(TableGridPickerOptions).map((key: string) => TableGridPickerOptions[key]);

    private selectedValue: TableGridPickerOptions = null;

    constructor(protected injector: Injector) {
        super(injector);
    }

    get selected(): TableGridPickerOptions {
      return this.selectedValue || TableGridPickerOptions.Inner;
    }

    onSelectChange(event: MouseEvent, value: TableGridPickerOptions): void {
        this.selectedValue = value;
        event.stopPropagation();
        this.valueChange.emit({value});

    }
}
