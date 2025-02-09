import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { PeMessageAppearanceColorMockupComponent } from './message-appearance-color-mockup.component';

describe('PeMessageAppearanceColorMockupComponent', () => {

  let fixture: ComponentFixture<PeMessageAppearanceColorMockupComponent>;
  let component: PeMessageAppearanceColorMockupComponent;

  beforeEach(waitForAsync(() => {

    TestBed.configureTestingModule({
      declarations: [PeMessageAppearanceColorMockupComponent],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PeMessageAppearanceColorMockupComponent);
      component = fixture.componentInstance;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should handle click', () => {

    const eventMock = {
      preventDefault: jasmine.createSpy('preventDefault'),
    };
    const emitSpy = spyOn(component.onSelect, 'emit');

    component.selected = false;
    component.onClick(eventMock);

    expect(eventMock.preventDefault).toHaveBeenCalled();
    expect(component.selected).toBe(true);
    expect(emitSpy).toHaveBeenCalledWith(true);

  });

});
