import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MediaDetailsWrapComponent } from './media-details-wrap.component';

describe('MediaDetailsWrapComponent', () => {
  let component: MediaDetailsWrapComponent;
  let fixture: ComponentFixture<MediaDetailsWrapComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MediaDetailsWrapComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MediaDetailsWrapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
