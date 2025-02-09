import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MitidStatusComponent } from './mitid-status.component';

describe('MitidStatusComponent', () => {

  let component: MitidStatusComponent;
  let fixture: ComponentFixture<MitidStatusComponent>;

  beforeEach(() => {

    TestBed.configureTestingModule({
      declarations: [MitidStatusComponent],
      imports: [],
      providers: [],
      schemas: [],
    }).compileComponents();

    fixture = TestBed.createComponent(MitidStatusComponent);
    component = fixture.componentInstance;

  });

  it('should be defined', () => {

    expect(component).toBeDefined();

  });

  it('should apply faded class based on input', () => {

    component.faded = true;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.status-wrap')?.classList).toContain('faded');

  });

  it('should display correct icon based on passed status', () => {

    component.passed = true;
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('use')?.getAttribute('xlink:href')).toBe('#icon-register-done-32');

  });

  it('should display title and note correctly', () => {

    const testTitle = 'Test Title';
    const testNote = 'Test Note';
    component.title = testTitle;
    component.note = testNote;
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.large-2')?.textContent).toContain(testTitle);
    expect(compiled.querySelector('.small-1')?.textContent).toContain(testNote);

  });

});
