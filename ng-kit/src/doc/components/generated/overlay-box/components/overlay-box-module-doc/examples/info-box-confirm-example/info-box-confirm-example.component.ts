import { Component } from '@angular/core';

@Component({
  selector: 'doc-info-box-confirm-example',
  templateUrl: 'info-box-confirm-example.component.html'
})
export class InfoBoxConfirmExampleDocComponent {

  onCancel(): void {
    alert('cancel');
  }

  onConfirm(): void {
    alert('confirm');
  }

}
