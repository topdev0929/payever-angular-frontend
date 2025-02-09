import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PeBuilderShareGetLinkComponent } from './get-link.component';

describe('PeBuilderShareGetLinkComponent', () => {
  let component: PeBuilderShareGetLinkComponent;
  let fixture: ComponentFixture<PeBuilderShareGetLinkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PeBuilderShareGetLinkComponent ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PeBuilderShareGetLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
