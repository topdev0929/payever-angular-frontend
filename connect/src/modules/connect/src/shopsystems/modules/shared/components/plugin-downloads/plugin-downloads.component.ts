import { Component, Injector, Input, ViewEncapsulation } from '@angular/core';

import { DownloadLinkInterface } from '../../../../types';
import { ApiKeysBaseComponent } from '../../../../../shared';

@Component({
  selector: 'plugin-downloads',
  templateUrl: './plugin-downloads.component.html',
  styleUrls: ['./plugin-downloads.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PluginDownloadsComponent extends ApiKeysBaseComponent {

  @Input() downloadLinks: DownloadLinkInterface[] = [];

  constructor(
    injector: Injector
  ) {
    super(injector);
  }
}
