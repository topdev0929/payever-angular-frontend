import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { UploadMediaComponent } from './upload-media.component';

describe('UploadMediaComponent', () => {
  let component: UploadMediaComponent;
  let fixture: ComponentFixture<UploadMediaComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ UploadMediaComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadMediaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
