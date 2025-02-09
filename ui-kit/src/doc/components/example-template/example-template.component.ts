import { Component, Input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'example-template',
  templateUrl: './example-template.component.html',
  encapsulation: ViewEncapsulation.None
})
export class ExampleTemplateComponent {
  @Input() id: string;
  @Input() title: string;
  @Input() templateCode: string;
  @Input() componentCode: string;
}
