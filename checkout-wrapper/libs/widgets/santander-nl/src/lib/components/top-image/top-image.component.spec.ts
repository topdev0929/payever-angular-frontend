import { ComponentFixture, TestBed } from '@angular/core/testing';

import {
  CommonImportsTestHelper,
  CommonProvidersTestHelper,
} from '@pe/checkout/testing';

import { TopImageComponent } from './top-image.component';


describe('widget-santander-nl-top-image', () => {
  let component: TopImageComponent;
  let fixture: ComponentFixture<TopImageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
      ],
      declarations: [
        TopImageComponent,
      ],
    });
    fixture = TestBed.createComponent(TopImageComponent);
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

  describe('component', () => {
    it('img', () => {
      fixture.detectChanges();
      const img = fixture.debugElement.nativeElement.querySelector('img');
      expect(img).toBeTruthy();
      expect(img.src).toEqual('https://cdn.test.devpayever.com/payment-widgets/images/balk-afm.png');
    });
  });
});

