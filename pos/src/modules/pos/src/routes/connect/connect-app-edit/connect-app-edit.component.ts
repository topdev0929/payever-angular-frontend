import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { EnvService } from '@pe/common';

import { PosEnvService } from '../../../services/pos/pos-env.service';

@Component({
  // tslint:disable-next-line component-selector
  selector: 'connect-app-edit',
  templateUrl: './connect-app-edit.component.html',
})
export class ConnectAppEditComponent implements OnInit {

  constructor(
    private activatedRoute: ActivatedRoute,
    @Inject(EnvService) private envService: PosEnvService,
  ) {
  }

  ngOnInit(): void {
  }

  get category(): string {
    return this.activatedRoute.snapshot.params.category
  }

  get integrationName(): string {
    return this.activatedRoute.snapshot.params.integrationName;
  }

  get backPath(): string {
    const {businessId, posId} = this.envService;
    return `/business/${businessId}/pos/${posId}/connect`;
  }
}
