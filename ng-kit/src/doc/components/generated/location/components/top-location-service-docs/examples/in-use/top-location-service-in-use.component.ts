import { Component } from '@angular/core';
import { parse as parseUrl, format as formatUrl } from 'url';
import { timer } from 'rxjs';
import { tap } from 'rxjs/operators';

import { TopLocationService } from '../../../../../../../../kit/location';

interface LocationData {
  key: string;
  value: string;
}

@Component({
  selector: 'doc-example-top-location-service-in-use',
  templateUrl: './top-location-service-in-use.component.html',
})
export class DocTopLocationServiceInUseComponent {

  assignUrl: string = formatUrl({
    ...parseUrl(window.top.location.href),
    hash: '#/modules/location'
  });

  displayedColumns: string[] = ['key', 'value'];

  tableData: LocationData[] = [
    'href',
  ].map(key => ({
    key,
    value: this.topLocation[key]
  }));

  constructor(
    public topLocation: TopLocationService,
  ) {}

  openUrlInTop(href: string): void {
    const currentHref: string = this.topLocation.href;
    // tslint:disable-next-line no-console
    
    this.topLocation.href = href; // <-- works like `window.top.location.href = href`
    timer(1000)
      // tslint:disable-next-line no-console
      .pipe(tap(() => null))
      .subscribe(() => this.topLocation.href = currentHref);
  }

}
