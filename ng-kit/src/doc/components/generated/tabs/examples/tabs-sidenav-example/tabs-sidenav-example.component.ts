import { Component, ViewChild, TemplateRef } from '@angular/core';
import { TabsSidenavConfigInterface } from "../../../../../../kit/tabs/src/interfaces";

@Component({
  selector: 'doc-tabs-sidenav-example',
  templateUrl: 'tabs-sidenav-example.component.html',
  styleUrls: ['tabs-sidenav-example.component.scss']
})
export class TabsSidenavExampleDocComponent {
  tabs: TabsSidenavConfigInterface[];
  defaultSelected: number = 0;
  @ViewChild('HeaderContent', { static: true }) HeaderContent: TemplateRef<any>;
  @ViewChild('SettingsContent', { static: true }) SettingsContent: TemplateRef<any>;
  @ViewChild('LinksContent', { static: true }) LinksContent: TemplateRef<any>;

  ngOnInit() {
    this.tabs = [
      {
        disabled: false,
        icon: '#icon-fe-float-left-32',
        content: this.HeaderContent,
        iconSize: 32
      },
      {
        disabled: false,
        icon: '#icon-settings-sliders-32',
        content: this.SettingsContent,
        iconSize: 32
      },
      {
        disabled: false,
        icon: '#icon-link-32',
        content: this.LinksContent,
        iconSize: 32
      },
    ];
  }

  onTabChange(i: number): void {
    
  }
}
