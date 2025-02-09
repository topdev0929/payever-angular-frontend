import { Component } from '@angular/core';
import { Observable } from 'rxjs';

import { InfoBoxService } from '../../../../../../../../kit/overlay-box';

@Component({
  selector: 'doc-blur-directive',
  templateUrl: 'blur-directive.component.html'
})
export class BlurDirectiveComponent {

  constructor(private infoBoxService: InfoBoxService) {
  }

  get blurred$(): Observable<boolean> {
    return this.infoBoxService.hasBlurBackdrop$;
  }

  // NOTE. If you have issues with change detection you can use this way:
  // blurred: boolean;
  // this.infoBoxService.hasBlurBackdrop$.subscribe((isBlur: boolean) => this.blurred = isBlur);
  // and in template [pe-blur]="blurred"
}
