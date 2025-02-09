import { Component } from '@angular/core';
import { PeProfileCardConfigInterface, PeProfileCardInterface, ProfileCardType } from '../../../../../../kit/profile-switcher/src/interfaces';
import * as uuid from 'uuid';

@Component({
  selector: 'doc-profile-switcher-example',
  templateUrl: 'profile-switcher-example.component.html',
  styleUrls: ['./profile-switcher-example.component.scss']
})
export class ProfileSwitcherExampleDocComponent {

  list: PeProfileCardInterface[] = [
    {
      logo: 'https://softwarebydefault.files.wordpress.com/2013/05/imagetoicon.jpg',
      name: 'Terminal 1',
      uuid: uuid()
    },
    {
      logo: 'http://www.nashi-dveri.spb.ru/tl_files/images/moov/furnitura%20v%20podarok.png',
      name: 'Terminal 2',
      uuid: uuid()
    }
  ];

  personalProfileCardConfig: PeProfileCardConfigInterface = {
    cardButtonText: `Your name`,
    images: [ null ],
    type: ProfileCardType.Personal
  };

  profileCardConfig: PeProfileCardConfigInterface = {
    type: ProfileCardType.Business,
    placeholderTitle: this.list[0].name,
    cardButtonText: this.list.length > 1
      ? `All ${this.list.length}`
      : this.list[0].name,
    images: this.list
      .slice(0, 3)
      .map((business: PeProfileCardInterface) => null),
    cardTitle: 'Terminals'
  };

  onProfileCardClick(): void {
    alert('Open terminal');
  }

  openPersonalProfile(): void {
    alert(`Open personal`);
  }

  onProfileFromListClick(profile: PeProfileCardInterface): void {
    alert(`Open terminal with uuid ${profile.uuid}`);
  }
}
