import { Directive, HostBinding, Input } from '@angular/core';

@Directive({
  selector: '[pe-blur]'
})
export class BlurDirective {
  @HostBinding('class.info-box-background-blurred') @Input('pe-blur') isBlurred: boolean;
}
