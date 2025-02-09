import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { unescape } from 'lodash-es';

@Pipe({
  name: 'raw'
})
export class RawPipe implements PipeTransform {

  constructor(
    private domSanitizer: DomSanitizer
  ) {}

  transform(value?: string): SafeHtml {
    return this.domSanitizer.bypassSecurityTrustHtml(
      unescape(value)
    );
  }

}
