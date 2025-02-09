import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { DrawerSettingsInterface } from '../../../../../../kit/sidenav';

@Component({
  selector: 'doc-drawer-default-example',
  templateUrl: 'drawer-default-example.component.html',
  styleUrls: ['drawer-default-example.component.scss']
})
export class DrawerDefaultExampleDocComponent implements OnInit {

  @ViewChild('drawerContent1', { static: true }) drawerContent1: TemplateRef<any>;
  @ViewChild('drawerContent2', { static: true }) drawerContent2: TemplateRef<any>;

  drawerSettings: DrawerSettingsInterface[];

  ngOnInit(): void {
    this.drawerSettings = [
      {
        opened: true,
        content: this.drawerContent1,
        position: 'start'
      },
      {
        opened: true,
        content: this.drawerContent2,
        position: 'end'
      }
    ];
  }
}
