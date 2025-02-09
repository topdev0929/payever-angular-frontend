import { Component } from '@angular/core';

@Component({
  selector: 'micro-addon-doc',
  templateUrl: 'micro-addon-doc.component.html'
})
export class MicroAddonDocComponent {
  htmlExample: string =  require('raw-loader!./examples/micro-addon-example-basic.html.txt');
}
