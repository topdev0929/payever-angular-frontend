import {Component} from '@angular/core';

@Component({
  selector: 'doc-paragraph-editor',
  templateUrl: './paragraph-editor-doc.component.html'
})
export class ParagraphEditorDocComponent {
  htmlExample: string =  require('raw-loader!./examples/paragraph-editor-example-basic.html.txt');

  public onEditorClosed(): void {
    
  }
}
