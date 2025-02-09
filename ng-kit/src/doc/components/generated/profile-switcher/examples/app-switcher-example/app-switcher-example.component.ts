import { Component } from '@angular/core';
import { PeProfileCardConfigInterface, PeProfileCardInterface, ProfileCardType, ProfileControlType, ProfileButtonControlInterface, ProfileMenuControlInterface } from '../../../../../../kit/profile-switcher/src/interfaces';
import * as uuid from 'uuid';

@Component({
  selector: 'doc-app-switcher-example',
  templateUrl: 'app-switcher-example.component.html',
  styleUrls: ['./app-switcher-example.component.scss']
})
export class AppSwitcherExampleDocComponent {

  list: PeProfileCardInterface[] = [
    {
      logo: 'https://softwarebydefault.files.wordpress.com/2013/05/imagetoicon.jpg',
      name: 'Terminal 1',
      uuid: uuid(),
      leftControl: {
        type: ProfileControlType.Button,
        title: 'Open',
        onClick: () => {
          alert('Open terminal');
        }
      } as ProfileButtonControlInterface,
      rightControl: {
        type: ProfileControlType.Menu,
        icon: 'icon-dots-h-24',
        menuItems: [
          {
            title: 'Edit',
            onClick: () => {
              alert('On edit terminal');
            }
          },
          {
            title: 'Delete',
            onClick: () => {
              alert('On delete terminal');
            }
          }
        ]
      } as ProfileMenuControlInterface
    },
    {
      logo: 'http://www.nashi-dveri.spb.ru/tl_files/images/moov/furnitura%20v%20podarok.png',
      name: 'Terminal 2',
      uuid: uuid(),
      leftControl: {
        type: ProfileControlType.Button,
        title: 'Open',
        onClick: () => {
          alert('Open terminal');
        }
      } as ProfileButtonControlInterface,
      rightControl: {
        type: ProfileControlType.Menu,
        icon: 'icon-dots-h-24',
        menuItems: [
          {
            title: 'Edit',
            onClick: () => {
              alert('On edit terminal');
            }
          },
          {
            title: 'Delete',
            onClick: () => {
              alert('On delete terminal');
            }
          }
        ]
      } as ProfileMenuControlInterface
    }
  ];

  profileCardConfig: PeProfileCardConfigInterface = {
    type: ProfileCardType.App,
    placeholderTitle: this.list[0].name,
    cardButtonText: '+ Add Terminal',
    images: this.list
      .slice(0, 2)
      .map((card: PeProfileCardInterface) => card.logo),
    onCardButtonClick: () => {
      alert('On add terminal');
    }
  };

  onProfileCardClick(): void {
    alert('Open terminal');
  }

  onProfileFromListClick(profile: PeProfileCardInterface): void {
    alert(`Open terminal with uuid ${profile.uuid}`);
  }
}
