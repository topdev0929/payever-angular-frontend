import { Component } from '@angular/core';

@Component({
  selector: 'search-doc',
  templateUrl: 'search-doc.component.html'
})
export class SearchDocComponent {
  htmlExample: string =  require('raw-loader!./examples/search-example-basic.html.txt');
}
