import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';

import { WidgetScaleService } from './widget.scale.service';

describe('widget-scale-service', () => {
  let service: WidgetScaleService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        WidgetScaleService,
      ],
    });

    httpTestingController = TestBed.inject(HttpTestingController);
    service = TestBed.inject(WidgetScaleService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    httpTestingController.verify();
  });

  it('should create an instance', () => {
    expect(service).toBeTruthy();
  });

  describe('service', () => {
    it('scale', () => {
      expect(service.scale).toEqual(1);
      service.scale = 2;
      expect(service.scale).toEqual(2);
      service.setDefault();
      expect(service.scale).toEqual(1);
      expect(service.scaleInCssValue).toEqual('scale(1)');
    });
  });
});
