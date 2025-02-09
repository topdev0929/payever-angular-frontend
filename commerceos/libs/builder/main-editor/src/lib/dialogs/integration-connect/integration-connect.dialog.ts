import { ChangeDetectionStrategy, Compiler, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  takeUntil,
  tap,
} from 'rxjs/operators';

import { PebIntegrationSubscriptionApiService } from '@pe/builder/integrations';
import { EnvService, NavigationService, PeDestroyService } from '@pe/common';

import { PeBuilderSubscription } from './integration-connect.model';

@Component({
  selector: 'peb-integration-connect',
  templateUrl: './integration-connect.dialog.html',
  styleUrls: ['./integration-connect.dialog.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebEditorIntegrationConnectDialog implements OnInit {
  subscriptions$: BehaviorSubject<PeBuilderSubscription[]> = new BehaviorSubject<PeBuilderSubscription[]>([]);
  selectedFileId$: BehaviorSubject<string> = new BehaviorSubject<string>('');
  saving$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  loading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  title = 'Connect';

  formGroup = this.formBuilder.group({});
  constructor(
  private dialogRef: MatDialogRef<PebEditorIntegrationConnectDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private navigationService: NavigationService,
    private subscriptionApi: PebIntegrationSubscriptionApiService,
    private router: Router,
    @Inject(EnvService) private shopEnv,
    private compiler: Compiler,
    private destroy$: PeDestroyService,
    private formBuilder: FormBuilder,
      ) {
  }

  ngOnInit(): void {
  this.loading$.next(true);
    this.subscriptionApi.getIntegrationSubscriptions()
      .pipe(
        tap((res) => {
          this.subscriptions$.next(res);
          res.map((subscription: PeBuilderSubscription) => {
            this.formGroup.addControl(subscription.integration.app, new FormControl(subscription.enabled));
          });
          this.loading$.next(false);
        })
      ).subscribe();
  }

  submitForm(): void {
    this.saving$.next(true);
    const changes = this.subscriptions$.value
      .filter(a => a.enabled !== this.formGroup.value[a.integration.app])
      .map(a => ({
        integrationName: a.integration.app,
        enabled: !a.enabled,
      }));
    for (let index = 0; index < changes.length; index++) {
      const change = changes[index];
      change.enabled ? this.subscriptionApi.enableIntegrationSubscription(change.integrationName).subscribe() :
        this.subscriptionApi.disableIntegrationSubscription(change.integrationName).subscribe();
      if (index === changes.length - 1) {
        this.closeForm();
      }
    }

    if (changes.length === 0) {
      this.closeForm();
    }
  }

  closeForm() {
    this.dialogRef.close();
  }

  selectItem(item: { fileId: string }) {
    this.selectedFileId$.next(item.fileId);
  }

  openIntegration(subscription: PeBuilderSubscription) {
    const integration = subscription.integration;
    this.preloadConnectMicro().pipe(
      tap(() => {
        this.closeForm();
        this.navigationService.saveReturn(location.pathname);
        this.router.navigate([
          `/business/${this.shopEnv.business._id}/connect`,
        ], { queryParams: { integration: integration.app.toLocaleLowerCase(), integrationCategory: 'design' } });
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  add() {
    this.preloadConnectMicro().pipe(
      tap(() => {
        this.closeForm();
        this.navigationService.saveReturn(location.pathname);
        this.router.navigate([
          `/business/${this.shopEnv.business._id}/connect`,
        ], { queryParams: { integrationName: 'design' } });
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  private preloadConnectMicro(): Observable<boolean> {
    return new Observable<boolean>((subscriber) => {
      // eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
      import('@pe/apps/connect').then(({ ConnectModule }) => {
        this.compiler.compileModuleAsync(ConnectModule).then((moduleFactory) => {
          subscriber.next(true);
        });
      });
    });
  }
}
