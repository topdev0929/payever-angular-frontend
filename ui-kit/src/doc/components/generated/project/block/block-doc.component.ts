import { Component } from '@angular/core';

@Component({
  selector: 'doc-block',
  templateUrl: 'block-doc.component.html'
})
export class BlockDocComponent {
    private blockExampleHtml: string = require('./block-example.component.html.txt');
}
