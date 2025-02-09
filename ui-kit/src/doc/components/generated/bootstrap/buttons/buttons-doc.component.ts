import { Component } from '@angular/core';
import { DocExamples } from '../../../../types/doc.interface';

@Component({
  selector: 'doc-buttons',
  templateUrl: 'buttons-doc.component.html'
})
export class ButtonsDocComponent {
  examples: DocExamples = {
    tags: require('!!raw-loader!./examples/button-tags.component.html'),
    styleVariations: require('!!raw-loader!./examples/button-style-variations.component.html'),
    sizes: require('!!raw-loader!./examples/button-sizes.component.html'),
    block: require('!!raw-loader!./examples/button-block.component.html'),
    rounded: require('!!raw-loader!./examples/button-rounded.component.html'),
    disabled: require('!!raw-loader!./examples/button-disabled.component.html'),
    icons: require('!!raw-loader!./examples/button-icons.component.html'),
    glow: require('!!raw-loader!./examples/button-glow.component.html'),
    fileInput: require('!!raw-loader!./examples/button-file-input.component.html'),
    social: require('!!raw-loader!./examples/button-social.component.html')
  };
}
