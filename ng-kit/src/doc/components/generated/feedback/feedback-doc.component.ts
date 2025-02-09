import { Component } from '@angular/core';

@Component({
  selector: 'feedback-doc',
  templateUrl: 'feedback-doc.component.html'
})
export class FeedbackDocComponent {
  htmlExample: string =  require('raw-loader!./examples/feedback-example-basic.html.txt');

  handleFeedbackValue($event: any) {
    
  }
}
