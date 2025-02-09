import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import resizeObserverPolyfill from 'resize-observer-polyfill';

import {
  CommonImportsTestHelper,
  CommonProvidersTestHelper,
} from '@pe/checkout/testing';

import { PaymentWidgetsSdkModule } from '../../../payment-widgets-sdk.module';
import { UIBaseComponent } from '../base.component';

import { UISelectedRateDetailsComponent } from './selected-rate-details.component';

describe('finexp-ui-selected-rate-details', () => {
  global['ResizeObserver'] = resizeObserverPolyfill;

  let component: InstanceType<typeof UISelectedRateDetailsComponent>;
  let fixture: ComponentFixture<UISelectedRateDetailsComponent>;

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

    fixture = TestBed.createComponent(UISelectedRateDetailsComponent);
    component = fixture.componentInstance;
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

  const mockCellWidth=() => {
      // somehow every size is zero!
      fixture.debugElement.queryAll(By.css('.cell'))
        .map(node => node.nativeElement as HTMLElement)
        .flatMap(el => Array.from(el.children))
        .forEach((el) => {
          jest.spyOn(el, 'clientWidth', 'get').mockReturnValue(200);
        });
  };

  describe('component', () => {
    it('resize with even items', () => {
      fixture.componentRef.setInput('details', [
        { title: 'title', value: 'value1' },
        { title: 'title', value: 'value2' },
        { title: 'title', value: 'value3' },
        { title: 'title', value: 'value4' },
      ]);
      fixture.detectChanges();

      mockCellWidth();

      component.onResize({
        contentRect: {
          width: 800,
        },
      } as ResizeObserverEntry);

      fixture.detectChanges();
      const grid = fixture.debugElement.query(By.css('.grid'))?.nativeElement;
      expect(grid).toBeTruthy();

      expect(grid.style.gridTemplateColumns).toEqual('repeat(2, 392px)');
      expect(grid.style.display).toEqual('grid');
    });

    it('resize with odd items', () => {
      fixture.componentRef.setInput('details', [
        { title: 'title', value: 'value1' },
        { title: 'title', value: 'value2' },
        { title: 'title', value: 'value3' },
      ]);
      fixture.detectChanges();

      mockCellWidth();

      component.onResize({
        contentRect: {
          width: 800,
        },
      } as ResizeObserverEntry);

      fixture.detectChanges();
      const grid = fixture.debugElement.query(By.css('.grid'))?.nativeElement;
      expect(grid).toBeTruthy();

      expect(grid.style.gridTemplateColumns).toEqual('repeat(2, 392px)');
      expect(grid.style.display).toEqual('grid');
    });

    it('should render cells', () => {
      fixture.componentRef.setInput('details', [
        { title: 'title', value: 'value' },
      ]);
      fixture.detectChanges();
      expect(fixture.debugElement.queryAll(By.css('.cell'))).toHaveLength(1);
    });

    it('Should set the text color', () => {
      fixture.componentRef.setInput('details', [
        { title: 'title', value: 'value1' },
        { title: 'title', value: 'value2' },
        { title: 'title', value: 'value3' },
        { title: 'title', value: 'value4' },
      ]);
      component.ngOnChanges();
      fixture.detectChanges();

      const host: HTMLElement = fixture.debugElement.nativeElement;
      expect(host.style.color).toEqual('rgb(51, 51, 51)');

      fixture.componentRef.setInput('config', {
        styles: {
          regularTextColor: '#ffffff',
        },
      });
      fixture.detectChanges();
      expect(host.style.color).toEqual('rgb(255, 255, 255)');
    });
  });
});

