import { Component, ChangeDetectionStrategy, Inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { PE_ENV, EnvironmentConfigInterface as EnvInterface } from '@pe/common';

@Component({
  selector: 'widget-santander-nl-top-image',
  templateUrl: './top-image.component.html',
  styles: [`
    :host {
      display: flex;
      justify-content: center;
      align-items: center;
      border-bottom: 1px solid #e8e8e8;
    }
    .top-image {
      height: 40px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopImageComponent {
  imgUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(`${this.env.custom.cdn}/payment-widgets/images/balk-afm.png`);
  constructor (
    private domSanitizer: DomSanitizer,
    @Inject(PE_ENV) private env: EnvInterface,
  ) {
  }
}
