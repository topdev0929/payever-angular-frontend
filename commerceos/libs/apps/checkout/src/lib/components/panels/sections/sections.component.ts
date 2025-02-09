import { Component, OnInit } from '@angular/core';

import { AbstractPanelComponent } from '../abstract-panel.component';

@Component({
  selector: 'panel-sections',
  templateUrl: './sections.component.html',
  styleUrls: ['./sections.component.scss'],
})
export class PanelSectionsComponent extends AbstractPanelComponent implements OnInit  {

  ngOnInit(): void {
    super.ngOnInit();
  }
}
