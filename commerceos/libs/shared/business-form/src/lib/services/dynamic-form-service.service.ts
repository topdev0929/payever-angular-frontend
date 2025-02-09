import { Injectable } from '@angular/core';

@Injectable()
export class DynamicFormServiceService {
  splitName(name: string): string[] {
    return name.split('.').filter(d => !!d);
  }
}
