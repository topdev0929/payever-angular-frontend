import { Component, Input } from '@angular/core';

/**
 * @deprecated Need to use pe-locales-switcher instead.
 */
@Component({
  selector: 'pe-locale-flag',
  templateUrl: './locale-flag.component.html'
})
export class LocaleFlagComponent {

  @Input() code: string;

}
