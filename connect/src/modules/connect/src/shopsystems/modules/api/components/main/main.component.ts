import { Component, Inject, Injector, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter, finalize, map, takeUntil } from 'rxjs/operators';

import { PE_OVERLAY_DATA } from '@pe/overlay-widget';

import { DownloadLinkInterface } from '../../../../types';
import { ShopsystemsStateService } from '../../../../services';
import {
  ApiKeysBaseComponent,
  IntegrationCategory,
  IntegrationInfoWithStatusInterface,
  IntegrationsStateService,
  UninstallService
} from '../../../../../shared';
import { PluginMainWrapComponent } from '../../../shared';

@Component({
  selector: 'main-api',
  templateUrl: './main.component.html',
  styleUrls: ['./../../../shared/components/plugin-main-wrap/plugin-main-wrap-parent.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ApiMainComponent extends ApiKeysBaseComponent implements OnInit {

  integration: IntegrationInfoWithStatusInterface;
  name: string = this.overlayData.integrationName;
  onDataLoad: BehaviorSubject<number> = this.overlayData.onDataLoad;
  downloadLinks: DownloadLinkInterface[] = [];

  integrationInfo$: Observable<IntegrationInfoWithStatusInterface> = null;

  @ViewChild('wrap') wrap: PluginMainWrapComponent;

  private integrationsStateService: IntegrationsStateService = this.injector.get(IntegrationsStateService);
  private shopsystemsStateService: ShopsystemsStateService = this.injector.get(ShopsystemsStateService);

  constructor(
    protected injector: Injector,
    @Inject(PE_OVERLAY_DATA) public overlayData: any,
    public uninstallService: UninstallService,
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.integrationInfo$ = this.integrationsStateService.getCategoryIntegrations(false, [IntegrationCategory.ShopSystems]).pipe(
      takeUntil(this.destroyed$),
      filter(d => !!d),
      map(data => {
        const integration = data.find(item => item.name === this.name);
        this.integration = integration;
        return integration;
      })
    );
    this.integrationInfo$.pipe(finalize(() => this.onDataLoad.next(1))).subscribe();
  }

  onKeyCreated(): void {
    if (this.wrap) {
      // Maybe should find better solution
      this.wrap.isAddingKey$.next(false);
    }
  }
}
