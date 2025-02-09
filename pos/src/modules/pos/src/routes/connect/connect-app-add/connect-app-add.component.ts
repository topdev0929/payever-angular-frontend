import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { TranslateService } from '@pe/i18n';
import { EnvService } from '@pe/common';

import { PosEnvService } from '../../../services/pos/pos-env.service';

@Component({
  selector: 'connect-app-add',
  templateUrl: './connect-app-add.component.html',
})
export class ConnectAppAddComponent implements OnInit {


  constructor(
    private activatedRoute: ActivatedRoute,
    public translationService: TranslateService,
    @Inject(EnvService) private envService: PosEnvService,
  ) {
  }

  ngOnInit(): void {
  }

  get category(): string {
    return this.activatedRoute.snapshot.params.category;
  }

  get backPath(): string {
    const { businessId, posId } = this.envService;
    return `/business/${businessId}/pos/${posId}/connect`;
  }
}
