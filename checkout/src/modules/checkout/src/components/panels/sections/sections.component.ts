import { Component, Injector } from '@angular/core';

import { AbstractPanelComponent } from '../abstract-panel.component';

@Component({
  // tslint:disable-next-line component-selector
  selector: 'panel-sections',
  templateUrl: './sections.component.html',
  styleUrls: ['./sections.component.scss']
})
export class PanelSectionsComponent extends AbstractPanelComponent {

  constructor(injector: Injector) {
    super(injector);
  }

  ngOnInit(): void {
    super.ngOnInit();
  }
}
