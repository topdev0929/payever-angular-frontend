import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatMenuModule } from '@angular/material/menu';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { PebEditorApi, PebShopsApi } from '@pe/builder-api';
import { MessageBus, PebEnvService } from '@pe/builder-core';
import { AppThemeEnum } from '@pe/common';
import { I18nModule, TranslatePipe } from '@pe/i18n';

import { PEB_SHOP_HOST } from '../../constants';
import { PebShopDashboardComponent } from './shop-dashboard.component';

describe('PebShopDashboardComponent', () => {

  let fixture: ComponentFixture<PebShopDashboardComponent>;
  let component: PebShopDashboardComponent;
  let messageBus: jasmine.SpyObj<MessageBus>;
  let api: jasmine.SpyObj<PebShopsApi>;
  let editorApi: any;
  let route: any;
  let envService: jasmine.SpyObj<PebEnvService>;

  beforeEach(waitForAsync(() => {

    const messageBusSpy = jasmine.createSpyObj<MessageBus>('MessageBus', ['emit']);

    const apiSpy = jasmine.createSpyObj<PebShopsApi>('PebShopsApi', ['getSingleShop']);

    const editorApiSpy = jasmine.createSpyObj<PebEditorApi>('PebEditorApi', ['getShopPreview']);
    editorApiSpy.getShopPreview.and.returnValue(of({ id: 'preview-001' }) as any);

    const routeMock = {
      snapshot: {
        params: {
          shopId: 'shop-001',
        },
      },
    };

    TestBed.configureTestingModule({
      imports: [
        MatMenuModule,
        I18nModule,
      ],
      declarations: [
        PebShopDashboardComponent,
        TranslatePipe,
      ],
      providers: [
        { provide: MessageBus, useValue: messageBusSpy },
        { provide: PebShopsApi, useValue: apiSpy },
        { provide: PebEditorApi, useValue: editorApiSpy },
        { provide: ActivatedRoute, useValue: routeMock },
        { provide: PebEnvService, useValue: null },
        { provide: PEB_SHOP_HOST, useValue: 'host.com' },
      ],
      schemas: [
        NO_ERRORS_SCHEMA,
      ],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebShopDashboardComponent);
      component = fixture.componentInstance;

      messageBus = TestBed.inject(MessageBus) as jasmine.SpyObj<MessageBus>;
      api = TestBed.inject(PebShopsApi) as jasmine.SpyObj<PebShopsApi>;
      editorApi = TestBed.inject(PebEditorApi);
      route = TestBed.inject(ActivatedRoute);
      envService = TestBed.inject(PebEnvService);

      api.getSingleShop.and.returnValue(of({
        id: 'shop-001',
        accessConfig: {
          internalDomain: 'internal.domain',
        },
      }) as any);

    });

  }));

  // it('should be defined', () => {
  //
  //   const cdrSpy = {
  //     markForCheck: jasmine.createSpy('markForCheck'),
  //   } as any;
  //
  //   fixture.detectChanges();
  //
  //   // w/o businessData
  //   envService = {
  //     businessData: undefined,
  //   } as any;
  //   expect(component).toBeDefined();
  //   expect(component.theme).toEqual(AppThemeEnum.default);
  //
  //   // w/o businessData.themeSettings
  //   envService.businessData = {
  //     themeSettings: undefined,
  //   } as any;
  //
  //   component = new PebShopDashboardComponent(
  //     messageBus,
  //     api,
  //     editorApi,
  //     route,
  //     cdrSpy,
  //     envService,
  //     '',
  //   );
  //
  //   expect(component.theme).toEqual(AppThemeEnum.default);
  //
  //   // w/ themeSettings
  //   envService.businessData.themeSettings = {
  //     theme: AppThemeEnum.light,
  //   };
  //
  //   component = new PebShopDashboardComponent(
  //     messageBus,
  //     api,
  //     editorApi,
  //     route,
  //     cdrSpy,
  //     envService,
  //     '',
  //   );
  //
  //   expect(component.theme).toEqual(AppThemeEnum.light);
  //
  // });

  it('should set shop on init', () => {

    const markSpy = spyOn(component[`cdr`], 'markForCheck');
    const shop = { id: 'shop-001' };

    api.getSingleShop.and.returnValue(of(shop) as any);

    component.ngOnInit();

    expect(component.shop).toEqual(shop as any);
    expect(markSpy).toHaveBeenCalled();

  });

  it('should emit on edit click', () => {

    component.onEditClick();

    expect(messageBus.emit).toHaveBeenCalledWith('shop.navigate.edit', 'shop-001');

  });

  it('should handle open click', () => {

    component.shop = { id: 'shop-001' };

    component.onOpenClick();

    expect(messageBus.emit).toHaveBeenCalledWith('shop.open', { id: 'shop-001' });

  });

});
