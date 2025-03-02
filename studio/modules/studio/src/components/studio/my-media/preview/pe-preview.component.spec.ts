import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PePreviewComponent } from './pe-preview.component';

describe('PreviewComponent', () => {
  let component: PePreviewComponent;
  let fixture: ComponentFixture<PePreviewComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PePreviewComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PePreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
