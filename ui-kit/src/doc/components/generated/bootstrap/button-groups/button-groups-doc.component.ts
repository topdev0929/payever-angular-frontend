import { Component } from '@angular/core';
import { DocExamples } from '../../../../types/doc.interface';

@Component({
  selector: 'doc-button-groups',
  templateUrl: 'button-groups-doc.component.html'
})
export class ButtonGroupsDocComponent {
  examples: DocExamples = {
    base: require('!!raw-loader!./examples/button-group-base.component.html'),
    dark: require('!!raw-loader!./examples/button-group-dark.component.html')
  };
}
