import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PeBuilderShareStylesComponent } from './builder-share.styles';

describe('PeBuilderShareStylesComponent', () => {
  let component: PeBuilderShareStylesComponent;
  let fixture: ComponentFixture<PeBuilderShareStylesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PeBuilderShareStylesComponent ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PeBuilderShareStylesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
