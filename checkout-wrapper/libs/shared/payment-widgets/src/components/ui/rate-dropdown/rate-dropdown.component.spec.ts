import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatMenuHarness } from '@angular/material/menu/testing';
import { By } from '@angular/platform-browser';
import resizeObserverPolyfill from 'resize-observer-polyfill';
import { from } from 'rxjs';
import { delayWhen, switchMap, tap } from 'rxjs/operators';

import {
  CommonImportsTestHelper,
  CommonProvidersTestHelper,
} from '@pe/checkout/testing';
import { RateInterface } from '@pe/checkout/types';

import { PaymentWidgetsSdkModule } from '../../../payment-widgets-sdk.module';
import { UIBaseComponent } from '../base.component';

import { UIRateDropdownComponent } from './rate-dropdown.component';

describe('finexp-ui-rate-dropdown', () => {
  let component: UIRateDropdownComponent;
  let fixture: ComponentFixture<UIRateDropdownComponent>;
  let loader: HarnessLoader;
  global['ResizeObserver'] = resizeObserverPolyfill;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
        PaymentWidgetsSdkModule,
      ],
      providers: [
        ...CommonProvidersTestHelper(),
      ],
    });
    fixture = TestBed.createComponent(UIRateDropdownComponent);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  afterEach(() => {
    fixture?.destroy();
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    it('Should create an instance', () => {
      expect(component).toBeTruthy();
      expect(component instanceof UIBaseComponent).toBeTruthy();
    });
  });

  describe('component', () => {
    it('Should set the text color', () => {
      fixture.componentRef.setInput('rates', [
        {
          listTitle: 'listTitle',
          selectedTitle: 'selectedTitle',
          selectedMultiTitles: [],
          details: [],
          value: 'value',
          raw: {},
          isOneLine: false,
          isDefault: false,
        },
      ]);
      fixture.detectChanges();

      const host: HTMLElement = fixture.debugElement.query(By.css('.rate-dropdown'))?.nativeElement;
      expect(host).toBeTruthy();
      expect(host.style.color).toEqual('rgb(51, 51, 51)');
      expect(host.style.background).toEqual('rgb(255, 255, 255)');
      expect(host.style.borderColor).toEqual('#e8e8e8');

      fixture.componentRef.setInput('config', {
        styles: {
          mainTextColor: '#ffffff',
          fieldBackgroundColor: '#000000',
          fieldLineColor: '#636363',
        },
      });
      fixture.detectChanges();
      expect(host.style.color).toEqual('rgb(255, 255, 255)');
      expect(host.style.background).toEqual('rgb(0, 0, 0)');
      expect(host.style.borderColor).toEqual('#636363');
    });
  });

  it('should close the menu on escape', () => {
    fixture.componentRef.setInput('rates', [
      {
        listTitle: 'listTitle',
        selectedTitle: 'selectedTitle',
        selectedMultiTitles: [],
        details: [],
        value: 'value',
        raw: {},
        isOneLine: false,
        isDefault: false,
      },
    ]);
    fixture.detectChanges();

    return from(loader.getHarness(MatMenuHarness)).pipe(
      tap((menu) => {
        expect(menu).toBeTruthy();
      }),
      delayWhen(menu => from(menu.open())),
      delayWhen(menu => from(menu.isOpen()).pipe(
        tap((isOpen) => {
          expect(isOpen).toBe(true);
        })
      )),
      tap(() => {
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'escape' }));
      }),
      switchMap(menu => from(menu.isOpen())),
      tap((isOpen) => {
        expect(isOpen).toBe(false);
      })
    ).toPromise();
  });

  it('should close the menu on escape', () => {
    const rates: RateInterface[] = [
      {
        listTitle: 'listTitle 1',
        selectedTitle: 'selectedTitle 1',
        selectedMultiTitles: [],
        details: [],
        value: 'value 1',
        raw: {},
        isOneLine: false,
        isDefault: false,
      },
      {
        listTitle: 'listTitle 2',
        selectedTitle: 'selectedTitle 2',
        selectedMultiTitles: [],
        details: [],
        value: 'value 2',
        raw: {},
        isOneLine: false,
        isDefault: false,
      },
    ];
    fixture.componentRef.setInput('rates', rates);
    fixture.detectChanges();

    return from(loader.getHarness(MatMenuHarness)).pipe(
      tap((menu) => {
        expect(menu).toBeTruthy();
      }),
      switchMap(menu => from(menu.open())),
      tap(() => {
        const items = fixture.debugElement.queryAll(By.css('.dropdown-list-item'));
        expect(items).toHaveLength(2);
        const rateSelectedEmitter = jest.spyOn(component.rateSelectedEmitter, 'emit');
        items[1].nativeElement.click();
        expect(component.rate.listTitle).toEqual(rates[1].listTitle);
        expect(rateSelectedEmitter).toHaveBeenCalled();
      }),
    ).toPromise();
  });

  it('show multi title', () => {
    fixture.componentRef.setInput('rates', [
      {
        listTitle: 'listTitle',
        selectedTitle: 'selectedTitle',
        selectedMultiTitles: [
          {
            label: 'multi-title-label-1',
            text: 'multi-title-text-1',
          },
          {
            label: 'multi-title-label-2',
            text: 'multi-title-text-2',
          },
        ],
        details: [],
        value: 'value',
        raw: {},
        isOneLine: false,
        isDefault: false,
      },
    ]);
    fixture.componentRef.setInput('useMultiTitle', true);
    fixture.detectChanges();
    const multiTitleCols = fixture.debugElement.queryAll(By.css('.multi-title-col'));
    expect(multiTitleCols).toHaveLength(2);
  });

  it('onResize', () => {
    fixture.componentRef.setInput('rates', [
      {
        listTitle: 'listTitle',
        selectedTitle: 'selectedTitle',
        selectedMultiTitles: [
          {
            label: 'multi-title-label-1',
            text: 'multi-title-text-1',
          },
          {
            label: 'multi-title-label-2',
            text: 'multi-title-text-2',
          },
        ],
        details: [],
        value: 'value',
        raw: {},
        isOneLine: false,
        isDefault: false,
      },
    ]);
    fixture.detectChanges();

    const target = fixture.debugElement.query(By.css('.single-title'))?.nativeElement;
    expect(target).toBeTruthy();
    component.onTitleResized({
      target,
    } as ResizeObserverEntry);

    return from(loader.getHarness(MatMenuHarness)).pipe(
      tap((menu) => {
        expect(menu).toBeTruthy();
      }),
      switchMap(menu => from(menu.open())),
      tap(() => {
        fixture.detectChanges();

        const menuPanel = fixture.debugElement.query(
          By.css('.mat-menu-panel')
        )?.nativeElement;
        const menuContent = fixture.debugElement.query(
          By.css('.mat-menu-content')
        )?.nativeElement;

        expect(menuPanel).toBeTruthy();
        expect(menuContent).toBeTruthy();

        expect(window.getComputedStyle(menuPanel).width).toEqual('54px');
        
        const styles = window.getComputedStyle(menuContent);
        expect(styles.paddingTop).toEqual('8px');
        expect(styles.paddingBottom).toEqual('8px');
      })
    ).toPromise();
  });
});

