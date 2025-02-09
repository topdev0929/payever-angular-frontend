import { Component } from '@angular/core';
import { MatChipList } from '@angular/material/chips';
import { MatFormFieldControl } from '@angular/material/form-field';

@Component({
  selector: 'pe-mat-form-field',
  templateUrl: 'mat-form-field.component.html',
  styleUrls: ['mat-form-field.component.scss'],
  providers: [{provide: MatFormFieldControl, useExisting: MatChipList}]
})
export class PeMatFormFieldComponent extends MatFormFieldControl<any> {

  setDescribedByIds(ids: string[]): void {
    
  }

  onContainerClick(event: MouseEvent): void {
    
  }
}
