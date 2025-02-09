import { Component } from '@angular/core';
import { parse as parseUrl, format as formatUrl } from 'url';
import { timer } from 'rxjs';
import { tap } from 'rxjs/operators';

import { LocationService } from '../../../../../../../../kit/location';

interface LocationData {
  key: string;
  value: string;
}

@Component({
  selector: 'doc-example-location-service-in-use',
  templateUrl: './location-service-in-use.component.html',
  styleUrls: ['./location-service-in-use.component.scss'],
})
export class DocLocationServiceInUseComponent {

  assignUrl: string = formatUrl({
    ...parseUrl(window.top.location.href),
    hash: '#/modules/location'
  });

  displayedColumns: string[] = ['key', 'value'];

  tableData: LocationData[] = [
    'host',
    'hostname',
    'href',
    'origin',
    'port',
    'protocol',
    'search',
  ].map(key => ({
    key,
    value: this.location[key]
  }));

  constructor(
    public location: LocationService,
  ) {}

  openUrl(href: string): void {
    const currentHref: string = this.location.href;
    // tslint:disable-next-line no-console

    this.location.href = href; // <-- works like `location.href = href`
    timer(1000)
      // tslint:disable-next-line no-console
      .pipe(tap(() => null))
      .subscribe(() => this.location.href = currentHref);
  }

}
