import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@pe/ng-kit/modules/i18n';
import { ClientLauncherService, NotFound } from '../../../../app/services';

@Component({
  selector: 'client-container',
  templateUrl: 'not-found.component.html',
  styleUrls: ['not-found.component.scss'],
})
export class NotFoundComponent implements OnInit {

  mode: 'not-found' | 'not-available';
  show: boolean;

  constructor(
    private activatedRoute: ActivatedRoute,
    private launcherService: ClientLauncherService,
    private router: Router,
    private translateService: TranslateService,
  ) {
  }


  get title(): string {
    const translationKey: string = this.launcherService.notFound === NotFound.Shop ? 'not_found.shop' : 'not_found.page';
    return this.translateService.translate(translationKey);
  }

  ngOnInit(): void {
    this.show = !!this.launcherService.notFound || this.launcherService.notAvailable;

    this.mode = this.activatedRoute.snapshot.data['mode'];

    if (!this.launcherService.notFound && !this.launcherService.notAvailable) {
      this.router.navigateByUrl('/');
    }
  }
}


