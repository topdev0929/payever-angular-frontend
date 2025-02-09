import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { IvyIframeComponent } from './ivy-iframe.component';

describe('ivy-iframe', () => {
  let component: IvyIframeComponent;
  let fixture: ComponentFixture<IvyIframeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        IvyIframeComponent,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(IvyIframeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
    fixture?.destroy();
  });

  it('should create an instance', () => {
    expect(component).toBeTruthy();
  });

  it('should contain iframe', () => {
    const iframe = fixture.debugElement.query(By.css('iframe')).nativeElement;
    expect(iframe).toBeTruthy();
    expect(iframe.src).toEqual('https://checkout.getivy.de/choose-your-bank?lng=en');
  });
});
