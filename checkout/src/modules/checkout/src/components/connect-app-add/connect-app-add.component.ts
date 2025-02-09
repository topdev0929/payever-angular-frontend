import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { HeaderService, StorageService } from '../../services';
import { IntegrationCategory } from '../../interfaces';

@Component({
  // tslint:disable-next-line component-selector
  selector: 'connect-app-add',
  templateUrl: './connect-app-add.component.html'
})
export class ConnectAppAddComponent implements OnInit {

  constructor(private storageService: StorageService,
              private headerService: HeaderService,
              private router: Router,
              private activatedRoute: ActivatedRoute
  ) {
  }

  ngOnInit(): void {
    this.headerService.setShortHeader('info_boxes.panels.connect', () => {
      this.router.navigate([this.backPath]);
    });
  }

  get checkoutUuid(): string {
    return this.activatedRoute.snapshot.params['checkoutUuid'] || this.activatedRoute.parent.snapshot.params['checkoutUuid'];
  }

  get category(): IntegrationCategory {
    return this.activatedRoute.snapshot.params['category'];
  }

  get backPath(): string {
    return `/business/${this.storageService.businessUuid}/checkout/${this.checkoutUuid}/panel-${this.category}`;
  }
}
