import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, isDevMode } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { PE_ENV } from '@pe/common';

@Component({
  selector: 'pe-dev-iframe',
  templateUrl: './dev-iframe.component.html',
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      gap: 30px;
      align-items: center;
      height: 100vh;
      padding: 32px;
    }
    iframe {
      width: 80%;
      height: 100%;
      border: 0;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
})
export class DevIframeComponent {

  private readonly env = inject(PE_ENV);
  private readonly domSanitizer = inject(DomSanitizer);

  protected channelSetId = 'ab9b1a9d-80e1-4632-a66e-efc39fd64338';

  protected get iframeSrc(): SafeResourceUrl {
    const domain = isDevMode() ? 'http://localhost:8090' : this.env.frontend.checkoutWrapper;

    return this.domSanitizer.bypassSecurityTrustResourceUrl(`${domain}/en/pay/create-flow/channel-set-id/${this.channelSetId}`);
  }
}
