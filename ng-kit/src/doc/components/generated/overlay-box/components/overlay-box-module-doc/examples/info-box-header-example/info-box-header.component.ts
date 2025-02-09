import { Component } from '@angular/core';

@Component({
  selector: 'doc-info-box-header-example',
  templateUrl: 'info-box-header.component.html'
})
export class InfoBoxHeaderDocComponent {
  onCloseCLick(): void {
    alert('closed');
  }
}
