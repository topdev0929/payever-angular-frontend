import { ComponentFixture, TestBed } from '@angular/core/testing';


import { LayoutLogoKitComponent } from './layout-logo.component';

describe('LayoutLogoKitComponent', () => {

  let component: LayoutLogoKitComponent;
  let fixture: ComponentFixture<LayoutLogoKitComponent>;

  beforeEach(() => {

    TestBed.configureTestingModule({
      declarations: [
        LayoutLogoKitComponent,
      ],
    });

    fixture = TestBed.createComponent(LayoutLogoKitComponent);
    component = fixture.componentInstance;

  });

  afterEach(() => {

    jest.clearAllMocks();
    fixture?.destroy();

  });

  it('should create an instance', () => {
    expect(component).toBeTruthy();
  });

  it('should handle default input', () => {
    expect(component.url).toBeUndefined();
  });

});
