import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';

import { DataInterface, HelperDialogComponent } from './helper-dialog.component';

describe('pe-helper-dialog', () => {
  let component: HelperDialogComponent;
  let fixture: ComponentFixture<HelperDialogComponent>;

  const matDialogData: DataInterface = {
    onClose: jest.fn(),
    template: null,
    buttons: [
      { title: 'Submit', classes: 'class-submit', click: jest.fn(), disabled: false, dismiss: false, order: 0 },
      { title: 'Close', classes: 'class-cancel', click: 'close', disabled: true, dismiss: false, order: 1 },
    ],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MatDialogModule],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: matDialogData },
      ],
      declarations: [HelperDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HelperDialogComponent);
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

  it('should render mat-dialog-actions', () => {
    expect(fixture.debugElement.query(By.css('mat-dialog-actions')).nativeElement).toBeTruthy();
  });

  it('should render all buttons correctly', () => {
    const buttons = fixture.debugElement.queryAll(By.css('button'));
    buttons.map(({ nativeElement: button }, index) => {
      const buttonConfig = matDialogData.buttons[index];
      expect(button).toBeTruthy();
      expect(button.type).toEqual('button');
      expect(button.className).toEqual(`btn ${buttonConfig.classes}`);
      expect(button.textContent).toContain(buttonConfig.title);
    });
  });

  it('should handle button click', () => {
    const buttons = fixture.debugElement.queryAll(By.css('button'));
    buttons.map(({ nativeElement: button }, index) => {
      const buttonConfig = matDialogData.buttons[index];
      button.click();
      if (buttonConfig.click === 'close') {
        expect(matDialogData.onClose).toHaveBeenCalled();
      } else {
        expect(buttonConfig.click).toHaveBeenCalled();
      }
    });
  });
});
