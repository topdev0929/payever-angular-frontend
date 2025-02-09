import { Component } from '@angular/core';
import { HeaderButtonInterface } from '../../../../../../kit/sidenav/src/interfaces';

interface ListInterface {
  title: string;
  onClick: () => void;
}

@Component({
  selector: 'doc-sidenav-switch-example',
  templateUrl: 'sidenav-switch-example.component.html',
  styleUrls: ['sidenav-switch-example.component.scss']
})
export class SidenavSwitchExampleDocComponent {

  leftButtonConfig: HeaderButtonInterface = {
    disabled: false,
    title: 'Back',
    icon: '#icon-arrow-left-small-16',
    onClick: () => {
      this.setSidenavState('main');
    }
  };

  rightButtonConfig: HeaderButtonInterface = {
    disabled: false,
    title: 'Done',
    onClick: () => {
      this.toggle();
    }
  };

  isOpen: boolean;
  list: ListInterface[];
  selectedListItem: string = 'main';

  ngOnInit() {
    this.list = [
      {
        onClick: () => this.setSidenavState('styles'),
        title: 'Text Styles'
      },
      {
        onClick: () => this.setSidenavState('buttons'),
        title: 'Buttons'
      },
      {
        onClick: () => this.setSidenavState('navigation'),
        title: 'Navigation'
      },
      {
        onClick: () => this.setSidenavState('page'),
        title: 'Page'
      },
    ];
  }

  toggle(): void {
    this.isOpen = !this.isOpen;
  }

  setSidenavState(listItem: string): void {
    this.selectedListItem = listItem;
    
  }
}
