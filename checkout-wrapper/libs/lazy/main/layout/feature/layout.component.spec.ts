import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { BehaviorSubject, timer } from 'rxjs';

import { AnalyticsFormService } from '@pe/checkout/analytics';
import { PluginEventsService, SnackBarShowerComponent } from '@pe/checkout/plugins';
import { SendToDeviceStorage } from '@pe/checkout/storage';
import { SetParams, SetSettings } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper, flowFixture, StoreHelper } from '@pe/checkout/testing';

import { GlobalCustomStylesComponent, TemporaryCdkOverlayStyleFixComponent } from '../presentation';
import { LayoutService } from '../services';

import { LayoutComponent } from './layout.component';

describe('Main Components: LayoutComponent', () => {
  const storeHelper = new StoreHelper();

  let fixture: ComponentFixture<LayoutComponent>;
  let component: LayoutComponent;

  let store: Store;
  let layoutService: LayoutService;
  let sendToDeviceStorage: SendToDeviceStorage;
  let pluginEventsService: PluginEventsService;
  const analyticsFormService = {
    emitEventFormInit: jest.fn(),
    initAnalyticForm: jest.fn(),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      declarations: [
        SnackBarShowerComponent,
        TemporaryCdkOverlayStyleFixComponent,
        GlobalCustomStylesComponent,
        LayoutComponent,
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        LayoutService,
        SendToDeviceStorage,
        PluginEventsService,
        { provide: AnalyticsFormService, useValue: analyticsFormService },
      ],
    });
  });

  beforeEach(() => {
    store = TestBed.inject(Store);
    layoutService = TestBed.inject(LayoutService);
    sendToDeviceStorage = TestBed.inject(SendToDeviceStorage);
    pluginEventsService = TestBed.inject(PluginEventsService);

    fixture = TestBed.createComponent(LayoutComponent);
    component = fixture.componentInstance;
    storeHelper.setMockData();
  });

  describe('Constructor', () => {
    it('should create the layout', () => {
      expect(component)
        .toBeTruthy();
    });
  });

  describe('orderSaved', () => {
    it('should orderSaved', () => {
      const toggleShowOrder = jest.spyOn(layoutService, 'toggleShowOrder');
      component.orderSaved();
      expect(toggleShowOrder).toHaveBeenCalledWith(false);
    });
  });

  describe('emitHeight', () => {
    const vgrid = 11;
    const extra = 40;
    const offsetHeight = 100;
    let pluginEventsServiceEmitHeight: jest.SpyInstance;

    beforeEach(() => {
      component['mainContentElRef'] = {
        nativeElement: {
          offsetHeight,
        },
      };
      pluginEventsServiceEmitHeight = jest.spyOn(pluginEventsService, 'emitHeight');
    });


    it('should emitHeight return null if showDefaultHeader$ is null ', (done) => {
      component['showDefaultHeader$'] = null;
      component['emitHeight']().subscribe((res) => {
        expect(res).toBeNull();
        done();
      });
    });

    it('should emitHeight perform correctly', (done) => {
      component['showDefaultHeader$'] = new BehaviorSubject<boolean>(true).asObservable();
      store.dispatch(new SetSettings({
        testingMode: true,
      }));
      const header: number = 5 * vgrid;
      const paddings: number = 2 * vgrid;
      const caution: number = 5 * vgrid;

      const expectedOffset = paddings + header + caution + extra + offsetHeight;

      component['emitHeight']().subscribe((res) => {
        expect(res).toEqual(flowFixture());
        expect(pluginEventsServiceEmitHeight).toHaveBeenCalledWith(flowFixture().id, expectedOffset);
        done();
      });
    });

    it('should emitHeight handle branch', (done) => {
      component['showDefaultHeader$'] = new BehaviorSubject<boolean>(false).asObservable();
      store.dispatch(new SetSettings({
        testingMode: false,
      }));
      const paddings: number = 2 * vgrid;

      const expectedOffset = paddings + extra + offsetHeight;

      component['emitHeight']().subscribe((res) => {
        expect(res).toEqual(flowFixture());
        expect(pluginEventsServiceEmitHeight).toHaveBeenCalledWith(flowFixture().id, expectedOffset);
        done();
      });
    });
  });

  describe('initFlow', () => {
    const defaultParams = {
      forceNoHeader: false,
      merchantMode: false,
      clientMode: false,
    };
    it('should initFlow emitLoaded with flow id', () => {
      const emitLoaded = jest.spyOn(pluginEventsService, 'emitLoaded');
      component.initFlow();
      expect(emitLoaded).toHaveBeenCalledWith(flowFixture().id);
    });
    it('should showDefaultHeader$ return true', (done) => {
      store.dispatch(new SetParams({
        forceNoHeader: false,
        merchantMode: true,
        clientMode: true,
      }));
      component.settings = {
        styles: {
          active: null,
        },
      };

      component.initFlow();

      component['showDefaultHeader$'].subscribe((res) => {
        expect(res).toBeTruthy();
        done();
      });

    });

    it('should showDefaultHeader$ return true if forceNoHeader true but active false', (done) => {
      store.dispatch(new SetParams({
        forceNoHeader: true,
        merchantMode: true,
        clientMode: true,
      }));
      component.settings = {
        styles: {
          active: false,
        },
      };

      component.initFlow();

      component['showDefaultHeader$'].subscribe((res) => {
        expect(res).toBeTruthy();
        done();
      });

    });

    it('should showDefaultHeader$ return false if forceNoHeader and active true', (done) => {
      store.dispatch(new SetParams({
        forceNoHeader: true,
        merchantMode: true,
        clientMode: true,
      }));
      component.settings = {
        styles: {
          active: true,
        },
      };

      component.initFlow();

      component['showDefaultHeader$'].subscribe((res) => {
        expect(res).toBeFalsy();
        done();
      });

    });

    it('should showDefaultHeader$ return false if merchantMode and clientMode false', (done) => {
      store.dispatch(new SetParams({
        forceNoHeader: false,
        merchantMode: false,
        clientMode: false,
      }));
      component.settings = {
        styles: {
          active: true,
        },
      };

      component.initFlow();

      component['showDefaultHeader$'].subscribe((res) => {
        expect(res).toBeFalsy();
        done();
      });

    });

    it('should checking height', fakeAsync(() => {
      store.dispatch(new SetParams(defaultParams));
      const emitHeight = jest.spyOn(component as any, 'emitHeight');
      component.initFlow();
      tick(1000);
      expect(emitHeight).toHaveBeenCalled();
    }));

    it('should update view model', (done) => {
      store.dispatch(new SetParams({
        ...defaultParams,
        forceFullScreen: true,
        forceNoPaddings: true,
        forceNoSnackBarNotifications: true,
        forceNoScroll: true,
        layoutWithPaddings: true,
      }));
      layoutService.showOrder$ = new BehaviorSubject<boolean>(true);
      const expectedVM = {
        forceFullScreen: true,
        forceNoScroll: true,
        forceNoSnackBarNotifications: true,
        layoutWithPaddings: true,
        gridCssClass: 'col-xs-12',
      };

      component.initFlow();
      component.vm$.subscribe((vm) => {
        expect(vm).toEqual(expectedVM);
        done();
      });
    });

    it('should update branch view model', (done) => {
      store.dispatch(new SetParams({
        ...defaultParams,
        forceFullScreen: true,
        forceNoPaddings: false,
        forceNoSnackBarNotifications: true,
        forceNoScroll: true,
        layoutWithPaddings: true,
      }));
      layoutService.showOrder$ = new BehaviorSubject<boolean>(false);
      const expectedVM = {
        forceFullScreen: true,
        forceNoScroll: true,
        forceNoSnackBarNotifications: true,
        layoutWithPaddings: true,
        gridCssClass: 'col-xs-12 col-sm-10 col-sm-offset-1 col-md-8 col-md-offset-2 col-lg-6 col-lg-offset-3',
      };

      component.initFlow();
      component.vm$.subscribe((vm) => {
        expect(vm).toEqual(expectedVM);
        done();
      });
    });
  });

  describe('ngAfterViewChecked', () => {
    it('should unsubscribe', () => {
      const sub1 = timer(1).subscribe();
      const sub2 = timer(1).subscribe();
      const sub3 = timer(1).subscribe();
      component['emitHeightSubscribtions'] = [sub1, sub2, sub3];

      const unsubscribeSub1 = jest.spyOn(sub1, 'unsubscribe');
      const unsubscribeSub2 = jest.spyOn(sub2, 'unsubscribe');
      const unsubscribeSub3 = jest.spyOn(sub3, 'unsubscribe');

      component.ngAfterViewChecked();

      expect(unsubscribeSub1).toHaveBeenCalled();
      expect(unsubscribeSub2).toHaveBeenCalled();
      expect(unsubscribeSub3).toHaveBeenCalled();
    });

    it('should call emitHeight', fakeAsync(() => {
      const emitHeight = jest.spyOn(component as any, 'emitHeight');

      component.ngAfterViewChecked();

      tick(1);
      expect(emitHeight).toHaveBeenCalledTimes(1);
      tick(200);
      expect(emitHeight).toHaveBeenCalledTimes(2);
      tick(500);
      expect(emitHeight).toHaveBeenCalledTimes(3);
    }));
  });

  describe('ngAfterViewInit', () => {
    it('should ngAfterViewInit', () => {
      const setIgnoreGetData = jest.spyOn(sendToDeviceStorage, 'setIgnoreGetData');
      const emitEventFormInit = jest.spyOn(analyticsFormService, 'emitEventFormInit');
      const layoutShownEmit = jest.spyOn(component.layoutShown, 'emit');

      component.ngAfterViewInit();

      expect(setIgnoreGetData).toHaveBeenCalledWith(false);
      expect(emitEventFormInit).toHaveBeenCalled();
      expect(layoutShownEmit).toHaveBeenCalled();
    });
  });

});
