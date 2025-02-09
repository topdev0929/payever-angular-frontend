import { Component } from '@angular/core';
import { peVariables } from '../../../../../../../../scss/pe-variables';

@Component({
  selector: 'card-transparent-example',
  templateUrl: 'card-transparent-example.component.html'
})
export class CardTransparentExampleComponent {
  collapseHeight: string = (peVariables.toNumber('gridUnitY') * 4) + 'px';
}
