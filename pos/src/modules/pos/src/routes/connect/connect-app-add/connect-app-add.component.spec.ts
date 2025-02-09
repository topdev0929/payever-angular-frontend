import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { EnvService } from '@pe/common';
import { TranslateService } from '@pe/i18n';
import { ConnectAppAddComponent } from './connect-app-add.component';

describe('ConnectAppAddComponent', () => {

  let fixture: ComponentFixture<ConnectAppAddComponent>;
  let component: ConnectAppAddComponent;

  beforeEach(waitForAsync(() => {

    const routeMock = {
      snapshot: {
        params: { category: 'test' },
      },
    };

    const envServiceMock = {
      posId: 'pos-001',
      businessId: 'b-001',
    };

    TestBed.configureTestingModule({
      declarations: [ConnectAppAddComponent],
      providers: [
        { provide: ActivatedRoute, useValue: routeMock },
        { provide: TranslateService, useValue: {} },
        { provide: EnvService, useValue: envServiceMock },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(ConnectAppAddComponent);
      component = fixture.componentInstance;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should get category', () => {

    expect(component.category).toEqual('test');

  });

  it('should get back path', () => {

    expect(component.backPath).toEqual('/business/b-001/pos/pos-001/connect');

  });

});
