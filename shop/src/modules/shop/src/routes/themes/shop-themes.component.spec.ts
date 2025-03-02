import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { MessageBus, PebEnvService } from '@pe/builder-core';

import { PebShopThemesComponent } from './shop-themes.component';
import { ThemesApi } from "@pe/themes";

describe('PebShopThemesComponent', () => {

  let fixture: ComponentFixture<PebShopThemesComponent>;
  let component: PebShopThemesComponent;
  let route: any;
  let messageBus: jasmine.SpyObj<MessageBus>;
  let envService: jasmine.SpyObj<PebEnvService>;

  beforeEach(waitForAsync(() => {

    const routeMock = {
      snapshot: {
        params: {
          shopId: 'shop-001',
        },
      },
    };

    const messageBusSpy = jasmine.createSpyObj<MessageBus>('MessageBus', ['emit']);

    const envServiceMock = {
      businessData: undefined,
    };

    TestBed.configureTestingModule({
      declarations: [
        PebShopThemesComponent,
      ],
      providers: [
        { provide: ActivatedRoute, useValue: routeMock },
        { provide: MessageBus, useValue: messageBusSpy },
        { provide: PebEnvService, useValue: envServiceMock },
        ThemesApi,
      ],
      schemas: [
        NO_ERRORS_SCHEMA,
      ],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebShopThemesComponent);
      component = fixture.componentInstance;

      route = TestBed.inject(ActivatedRoute);
      messageBus = TestBed.inject(MessageBus) as jasmine.SpyObj<MessageBus>;
      envService = TestBed.inject(PebEnvService);

    });

  }));

  it('should handle theme installed', () => {

    component.onThemeInstalled();

    expect(messageBus.emit).toHaveBeenCalledWith('shop.navigate.edit', 'shop-001');

  });

});
