import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { IntegrationCategory } from '@pe/shared/checkout';

import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'connect-app-edit',
  template: '',
})
export class ConnectAppEditComponent implements OnInit {

  constructor(
    private storageService: StorageService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
  ) {
  }


  get checkoutUuid(): string {
    return this.activatedRoute.snapshot.params['checkoutUuid']
    || this.activatedRoute.parent.snapshot.params['checkoutUuid'];
  }

  get category(): IntegrationCategory {
    return this.activatedRoute.snapshot.params['category'];
  }

  get integrationName(): string {
    return this.activatedRoute.snapshot.params['integrationName'];
  }

  get backPath(): string {
    return `/business/${this.storageService.businessUuid}/checkout/${this.checkoutUuid}/panel-${this.category}`;
  }

  ngOnInit(): void {
    this.router.navigate(
      [`/business/${this.storageService.businessUuid}/connect/open/${this.integrationName}`],
      {
        queryParams: {
          backPath: this.backPath,
        },
      }
    );
  }
}
