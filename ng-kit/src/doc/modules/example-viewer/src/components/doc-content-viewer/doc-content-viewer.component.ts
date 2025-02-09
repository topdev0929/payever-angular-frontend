import { Component, Input, ViewEncapsulation } from '@angular/core';
import { DocContentSettingsInterface } from '../../interfaces';

@Component({
  selector: 'doc-content-viewer',
  templateUrl: './doc-content-viewer.component.html',
  styleUrls: ['./doc-content-viewer.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DocContentViewerComponent {

  @Input() settings: DocContentSettingsInterface;

}
