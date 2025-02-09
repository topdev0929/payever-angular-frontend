import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { take, tap } from 'rxjs/operators';

import { EnvironmentConfigInterface, PE_ENV } from '@pe/common';

import { saveAs } from 'file-saver';

export interface ImportEventPayload {
  overwrite: boolean;
}

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'pf-import-menu',
  templateUrl: 'import-menu.component.html',
  styleUrls: ['./import-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImportMenuComponent implements OnInit {
  @Output() importCSV = new EventEmitter<ImportEventPayload>();
  @Output() importXML = new EventEmitter<ImportEventPayload>();

  overwrite = false;
  showCSVTooltip = false;
  showXMLTooltip = false;

  constructor(@Inject(PE_ENV) public env: EnvironmentConfigInterface, private httpClient: HttpClient) {}

  ngOnInit() {}

  downloadFile(event: Event, name: string) {
    event.preventDefault();
    this.httpClient
      .get(`${this.env.custom.cdn}/${name}`, {
        responseType: 'blob',
      })
      .pipe(
        take(1),
        tap(resp => {
          saveAs(resp, name);
        }),
      )
      .subscribe();
  }

  onMenuClosed() {
    this.showCSVTooltip = false;
    this.showXMLTooltip = false;
    this.overwrite = false;
  }
}
