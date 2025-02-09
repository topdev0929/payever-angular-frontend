import { importProvidersFrom } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import {
  CommonImportsTestHelper,
  CommonProvidersTestHelper,
} from '@pe/checkout/testing';

import { PaymentWidgetsSdkModule } from '../../../payment-widgets-sdk.module';
import { UIBaseComponent } from '../base.component';

import { UISelectedRateDetailsLineComponent } from './selected-rate-details-line.component';

describe('ui-selected-rate-details-line-component', () => {
  let component: UISelectedRateDetailsLineComponent;
  let fixture: ComponentFixture<UISelectedRateDetailsLineComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
        PaymentWidgetsSdkModule,
      ],
      providers: [
        importProvidersFrom(PaymentWidgetsSdkModule),
        ...CommonProvidersTestHelper(),
      ],
    });
    fixture = TestBed.createComponent(UISelectedRateDetailsLineComponent);
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

  describe('component', () => {
    it('Should set the text color', () => {
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

    it('Should render details', () => {
      const cells = [
        { title: 'cell 1 title', value: 'cell 1 title' },
        { title: 'cell 2 title', value: 'cell 2 title' },
        { title: 'cell 3 title', value: 'cell 3 title' },
        { title: 'cell 4 title', value: 'cell 4 title' },
      ];
      component.details = cells;
      fixture.detectChanges();
      const childs = fixture.debugElement.queryAll(By.css('.rate-cell'))
        .map(node => [
          node.query(By.css('.rate-cell__title')),
          node.query(By.css('.rate-cell__value')),
        ].map(node => node.nativeElement.innerHTML));

      expect(childs).toMatchObject(
        cells.map(cell => [cell.title, cell.value])
      );
    });
  });
});

