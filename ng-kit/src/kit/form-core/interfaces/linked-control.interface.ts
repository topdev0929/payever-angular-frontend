import { AbstractControl } from '@angular/forms';

export interface LinkedControlInterface {
  control: AbstractControl | string;
  propertyName?: string;
  transform?(data: any, propertyName?: string): any;
}
