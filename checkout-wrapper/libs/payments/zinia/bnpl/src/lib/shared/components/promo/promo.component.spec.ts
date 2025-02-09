import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';

import { PromoComponent } from './';

describe('PromoComponent', () => {
  let fixture: ComponentFixture<PromoComponent>;
  let component: PromoComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
      ],
    });
    fixture = TestBed.createComponent(PromoComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('Constructor', () => {
    it('Should create an instance', () => {
      expect(component).toBeTruthy();
    });
  });

  it('should load icons on init', () => {
    const mockLoadIcons = jest.fn();
    (window as any).PayeverStatic = {
      SvgIconsLoader: {
        loadIcons: mockLoadIcons,
      },
    };

    component.ngOnInit();

    expect(mockLoadIcons).toHaveBeenCalledWith([
      'payment-after-delivery-32',
      'payment-keep-32',
      'payment-pause-32',
    ]);

  });
});
