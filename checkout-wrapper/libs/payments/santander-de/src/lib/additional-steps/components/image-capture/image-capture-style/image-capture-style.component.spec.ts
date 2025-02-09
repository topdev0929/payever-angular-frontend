import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';
import { ProgressButtonContentComponent } from '@pe/checkout/ui/progress-button-content';

import { ImageCaptureStyleComponent } from './image-capture-style.component';

describe('image-capture-style', () => {
  let component: ImageCaptureStyleComponent;
  let fixture: ComponentFixture<ImageCaptureStyleComponent>;

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
    fixture = TestBed.createComponent(ImageCaptureStyleComponent);
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

