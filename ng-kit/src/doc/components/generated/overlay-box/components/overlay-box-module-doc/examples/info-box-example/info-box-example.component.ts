import { Component } from '@angular/core';

import { InfoBoxService } from '../../../../../../../../kit/overlay-box';

@Component({
  selector: 'doc-info-box-example',
  templateUrl: 'info-box-example.component.html'
})
export class InfoBoxExampleDocComponent {

  constructor(private infoBoxLoadingService: InfoBoxService) {}

  showLoading(isLoading: boolean): void {
    this.infoBoxLoadingService.loading = isLoading;
  }

  onClose(): void {
    alert('closed');
  }

}
