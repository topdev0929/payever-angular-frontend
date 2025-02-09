import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';
import { ProgressButtonContentComponent } from '@pe/checkout/ui/progress-button-content';

import { PosImageCaptureStyleComponent } from './image-capture-style.component';

describe('pos-image-capture-style', () => {
  let component: PosImageCaptureStyleComponent;
  let fixture: ComponentFixture<PosImageCaptureStyleComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        ProgressButtonContentComponent,
      ],
    });
    fixture = TestBed.createComponent(PosImageCaptureStyleComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    fixture?.destroy();
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    it('Should create an instance', () => {
      expect(component).toBeTruthy();
    });
  });
});

