import { Component } from '@angular/core';

@Component({
  selector: 'doc-progressbars',
  templateUrl: 'progressbars-doc.component.html'
})
export class ProgressbarsDocComponent {
  exampleProgress1: string = `<progressbar value="60"></progressbar>`;

  exampleProgress2: string = `
<progressbar value="20" class="progress-lg"></progressbar>
<progressbar value="40"></progressbar>
<progressbar value="60" class="progress-sm"></progressbar>
<progressbar value="80" class="progress-xs"></progressbar>`;

  exampleProgress3: string = `<progressbar value="40">40%</progressbar>`;

  exampleProgress4: string = `
<progressbar value="30" type="warning"></progressbar>
<progressbar value="60" type="danger"></progressbar>
<progressbar value="90" type="success"></progressbar>`;

  exampleProgress5: string = `<progressbar value="50" class="progress-striped"></progressbar>`;
}
