import { Component, Input } from '@angular/core';

@Component({
  selector: 'toolbar',
  templateUrl: 'toolbar.component.html',
  styleUrls: ['toolbar.component.scss']
})
export class ToolbarComponent {
  @Input() toolbarColor: string;
  @Input() displayChildrenAsRows: boolean = false;
}
