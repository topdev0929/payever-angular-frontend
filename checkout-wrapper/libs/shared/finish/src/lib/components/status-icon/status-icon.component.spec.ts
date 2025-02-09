import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { StatusIconComponent } from './status-icon.component';

describe('checkout-sdk-finish-status-icon', () => {
  let component: StatusIconComponent;
  let fixture: ComponentFixture<StatusIconComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StatusIconComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StatusIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture?.destroy();
  });

  const checkIcon = (href: string) => {
    const p = fixture.debugElement.query(By.css('p')).nativeElement;
    const svg = fixture.debugElement.query(By.css('svg')).nativeElement;
    const use = fixture.debugElement.query(By.css('use')).nativeElement;
    expect(p).toBeTruthy();
    expect(svg).toBeTruthy();
    expect(use.getAttribute('xlink:href')).toEqual(href);
  };

  it('should create an instance', () => {
    expect(component).toBeTruthy();
  });

  it('should get correct icons', () => {
    [
      {
        status: 'success',
        icon: '#icon-success-36',
      },
      {
        status: 'pending',
        icon: '#icon-pending-36',
      },
      {
        status: 'fail',
        icon: '#icon-error-36',
      },
    ].map((element) => {
      fixture.componentRef.setInput('status', element.status);
      fixture.detectChanges();
      checkIcon(element.icon);
    });
  });
});
