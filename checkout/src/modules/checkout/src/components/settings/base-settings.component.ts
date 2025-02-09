import { Directive, Injector, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { SnackBarService } from '@pe/forms';

import { AbstractComponent } from '../../components';

@Directive()
export abstract class BaseSettingsComponent extends AbstractComponent implements OnInit {

  isModal: boolean;
  protected activatedRoute: ActivatedRoute = this.injector.get(ActivatedRoute);
  protected router: Router = this.injector.get(Router);
  protected snackBarService: SnackBarService = this.injector.get(SnackBarService);

  constructor(protected injector: Injector) {
    super();
  }

  ngOnInit(): void {
    this.isModal = this.activatedRoute?.snapshot.data['modal'] || this.activatedRoute?.parent?.snapshot.data['modal'];
  }

  backToModal(): void {
    // TODO pass payments,settings as param somehow
    this.router.navigate([ '../../panel-settings' ], { relativeTo: this.activatedRoute });
  }

  protected showError(error: string): void {
    this.snackBarService.toggle(true, error || 'Unknown error', {
      duration: 5000,
      iconId: 'icon-alert-24',
      iconSize: 24
    });
  }
}
