import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { EnvService } from '@pe/common';

import { PosEnvService } from '../../../services/pos-env.service';

@Component({
  selector: 'connect-app-edit',
  template: '',
})
export class ConnectAppEditComponent implements OnInit{

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    @Inject(EnvService) private envService: PosEnvService,
  ) {
  }

  get category(): string {
    return this.activatedRoute.snapshot.params.category;
  }

  get integrationName(): string {
    return this.activatedRoute.snapshot.params.integrationName;
  }

  get backPath(): string {
    const { businessId, posId } = this.envService;

    return `/business/${businessId}/pos/${posId}/connect`;
  }

  ngOnInit(): void {
    const { businessId } = this.envService;

    this.router.navigate(
      [`/business/${businessId}/connect/open/${this.integrationName}`],
      {
        queryParams: {
          backPath: this.backPath,
        },
      }
    );
  }
}
