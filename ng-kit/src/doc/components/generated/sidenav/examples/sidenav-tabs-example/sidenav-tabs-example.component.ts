import { Component, ViewChild, TemplateRef } from '@angular/core';
import { TabsSidenavConfigInterface } from '../../../../../../kit/tabs/src/interfaces';
import { HeaderButtonInterface } from '../../../../../../kit/sidenav/src/interfaces';

@Component({
  selector: 'doc-sidenav-tabs-example',
  templateUrl: 'sidenav-tabs-example.component.html',
  styleUrls: ['sidenav-tabs-example.component.scss']
})
export class SidenavTabsExampleDocComponent {
  isOpen: boolean;
  tabs: TabsSidenavConfigInterface[];
  defaultSelected: number = 0;
  @ViewChild('HeaderContent', { static: true }) HeaderContent: TemplateRef<any>;
  @ViewChild('SettingsContent', { static: true }) SettingsContent: TemplateRef<any>;
  @ViewChild('LinksContent', { static: true }) LinksContent: TemplateRef<any>;

  rightButtonConfig: HeaderButtonInterface = {
    disabled: false,
    title: 'Done',
    onClick: () => {
      this.toggle()
    }
  };

  ngOnInit() {
    this.tabs = [
      {
        disabled: false,
        icon: '#icon-sb-header-position-3-32',
        content: this.HeaderContent,
        iconSize: 32
      },
      {
        disabled: false,
        icon: '#icon-sb-settings-32',
        content: this.SettingsContent,
        iconSize: 32
      },
      {
        disabled: false,
        icon: '#icon-sb-links-32',
        content: this.LinksContent,
        iconSize: 32
      },
    ];
  }

  toggle(): void {
    this.isOpen = !this.isOpen;
  }

  onTabChange(index: number): void {
    
  }
}
