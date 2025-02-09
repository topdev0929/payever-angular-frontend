import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PebSiteBuilderInsertComponent } from './builder-insert.component';

describe('PebSiteBuilderInsertComponent', () => {
  let component: PebSiteBuilderInsertComponent;
  let fixture: ComponentFixture<PebSiteBuilderInsertComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PebSiteBuilderInsertComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PebSiteBuilderInsertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
