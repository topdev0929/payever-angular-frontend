import { ChangeDetectionStrategy, ChangeDetectorRef, Compiler, Component, Injector, OnInit } from '@angular/core';
import { catchError, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

import { NavigationService } from '@pe/connect-app';
import { AppThemeEnum } from '@pe/common';

import { AbstractComponent } from '../../../shared/abstract';
import { PeConnectionApi } from '../../../api/connection/abstract.connection.api';

@Component({
  selector: 'pe-connect-list',
  templateUrl: './connect-list.component.html',
  styleUrls: ['./connect-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeConnectListComponent extends AbstractComponent implements OnInit {
  theme = AppThemeEnum.default;
  paymentMethods;

  protected compiler: Compiler = this.injector.get(Compiler);
  protected router: Router = this.injector.get(Router);
  protected navigationService: NavigationService = this.injector.get(NavigationService);


  constructor(
    protected injector: Injector,
    private cdr: ChangeDetectorRef,
    private connectionApi: PeConnectionApi,
    ) {
    super();
  }

  ngOnInit() {
    this.getPaymentMethods();
  }
  getPaymentMethods() {
    this.paymentMethods = this.connectionApi.getAllConnections().pipe(
      map((data: any) => {
        return data;
      }),
      catchError((err) => {
        throw new Error(err);
      }),
    );
  }

  onToggle(connectionId: string, currentState: boolean) {
    if (currentState) {
      this.connectionApi.updateConnectionUnInstall(connectionId).subscribe();
    } else {
      this.connectionApi.updateConnectionInstall(connectionId).subscribe();
    }
  }

  addConnection() {
    const businessUuid = this.router.url.split('business/')[1]?.split('/')[0];
    this.cdr.detectChanges();
    this.preloadConnectMicro().subscribe(() => {
      this.navigationService.saveReturn(this.router.url);
      this.router.navigate([
        `/business/${businessUuid}/connect`,
      ], { queryParams: { integrationName: 'payments' } });
    });
  }

  openIntegrationConfiguration(connection) {
    const businessUuid = this.router.url.split('business/')[1]?.split('/')[0];
    this.preloadConnectMicro().subscribe(() => {
      this.router.navigate([
        `/business/${businessUuid}/connect`,
      ], {queryParams: {integration: connection.integration.name,
        integrationCategory: connection.integration.category }});
    });
  }

  private preloadConnectMicro(): Observable<boolean> {
    return new Observable<boolean>((subscriber: any) => {
      import('@pe/connect-app').then((({ ConnectModule }) => {
        this.compiler.compileModuleAsync(ConnectModule).then(() => {
          subscriber.next(true);
        });
      }));
    });
  }
}
