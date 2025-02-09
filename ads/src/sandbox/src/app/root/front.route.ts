import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'peb-sandbox-root',
  templateUrl: './front.route.html',
  styleUrls: ['./front.route.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SandboxFrontRoute {
  ads = [
    {
      name: 'First ad',
    },
    {
      name: 'Second ad',
    },
    {
      name: 'Third ad',
    }
  ];

  pickAd(ad) {
    console.log(ad.name);
  }
}
