import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { LoaderService } from '@pe/checkout/core/loader';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'download-file',
  template: `
  <h1 translate>download_file.title</h1>
  <p translate>download_file.text</p>
  <br>
  <a [href]="link" target="_blank">{{ name }}</a>
  `,
})
export class DownloadFileComponent {

  name: string = null;
  link: string = null;

  constructor(private loaderService: LoaderService,
              private activatedRoute: ActivatedRoute) {
    this.loaderService.loaderGlobal = false;

    // Mostly we need it as IE
    this.name = this.activatedRoute.snapshot.queryParams.name;
    this.link = this.activatedRoute.snapshot.queryParams.link;
  }
}
