import { Directive, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[phoneInputFilter]',
})
export class PhoneInputFilterDirective {

  private patternInputReplace: RegExp = /[^\+0-9\(\)\-]/g;
  private duplicatedSymbolsReplace: RegExp = /\+(?=\++)|\-(?=\-+)|\((?=\(+)|\)(?=\)+)/g;

  constructor(
    private ngControl: NgControl
  ) {
  }

  @HostListener('input', ['$event']) onEvent(): void {
    this.mutateValue(this.ngControl.value);
  }

  private mutateValue(value: string = ''): void {
    const filtered: string = this.filterValue(value);
    this.ngControl.control.setValue(filtered);
  }

  private filterValue(value: string): string {
    return String(value || '')
      .replace(this.patternInputReplace, '')
      .replace(this.duplicatedSymbolsReplace, '')
      .trim();
  }

}
