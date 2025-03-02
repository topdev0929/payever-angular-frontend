import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import {AppThemeEnum, EnvService, MessageBus} from '@pe/common';

import { PebThemeGridComponent } from './theme-grid.component';
import {SiteEnvService} from '../../service/site-env.service';

describe('PebThemeGridComponent', () => {

  let fixture: ComponentFixture<PebThemeGridComponent>;
  let component: PebThemeGridComponent;
  let route: any;
  let messageBus: jasmine.SpyObj<MessageBus>;
  let envService: jasmine.SpyObj<SiteEnvService>;

  beforeEach(waitForAsync(() => {

    const routeMock = {
      snapshot: {
        params: {
          siteId: 'site-001',
        },
      },
    };

    const messageBusSpy = jasmine.createSpyObj<MessageBus>('MessageBus', ['emit']);

    const envServiceMock = {
      businessData: undefined,
    };

    TestBed.configureTestingModule({
      declarations: [
        PebThemeGridComponent,
      ],
      providers: [
        { provide: ActivatedRoute, useValue: routeMock },
        { provide: MessageBus, useValue: messageBusSpy },
        { provide: SiteEnvService, useValue: envServiceMock },
      ],
      schemas: [
        NO_ERRORS_SCHEMA,
      ],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebThemeGridComponent);
      component = fixture.componentInstance;

      route = TestBed.inject(ActivatedRoute);
      messageBus = TestBed.inject(MessageBus) as jasmine.SpyObj<MessageBus>;
      envService = TestBed.inject(SiteEnvService);

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    // w/o businessData
    expect(component).toBeDefined();
    expect(component.theme).toEqual(AppThemeEnum.default);

    // w/o businessData.themeSettings
    envService.businessData = {
      themeSettings: undefined,
    } as any;

    component = new PebThemeGridComponent(
      null,
      route,
      messageBus,
      envService,
    );

    expect(component.theme).toEqual(AppThemeEnum.default);

    // w/ themeSettings
    envService.businessData.themeSettings = {
      theme: AppThemeEnum.light,
    };

    component = new PebThemeGridComponent(
      null,
      route,
      messageBus,
      envService,
    );

    expect(component.theme).toEqual(AppThemeEnum.light);

  });

  it('should handle theme installed', () => {

    component.onThemeInstalled();

    expect(messageBus.emit).toHaveBeenCalledWith('site.navigate.edit', 'site-001');

  });

});
