import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { DIALOG_DATA } from '@pe/checkout/dialog';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';

import { AdditionalStepsModule } from '../../additional-steps.module';

import { ConfirmDialogComponent, ConfirmDialogOverlayData } from './confirm-dialog.component';

describe('ConfirmDialogComponent', () => {
  let component: ConfirmDialogComponent;
  let fixture: ComponentFixture<ConfirmDialogComponent>;

  const dialogData: ConfirmDialogOverlayData = {
    requirementsTitle: '',
    requirements: [
      '',
    ],
    header: {
      title: '',
      subtitle: '',
    },
    confirmBtnText: '',
    actions: {
      confirm: jest.fn(),
      skip: jest.fn(),
    },
  };


  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
        AdditionalStepsModule,
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        {
          provide: DIALOG_DATA,
          useValue: dialogData,
        },
      ],
      declarations: [
        ConfirmDialogComponent,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    jest.resetAllMocks();
    fixture?.destroy();
  });

  it('should create an instance', () => {
    expect(component).toBeTruthy();
  });

  describe('component', () => {
    it('should call confirm on click', () => {
      const confirmBtn = fixture.debugElement.query(By.css('.action-button'));
      component.dialogRef = {
        close: jest.fn(),
      } as any;

      expect(confirmBtn).toBeTruthy();
      confirmBtn.nativeElement.click();
      expect(dialogData.actions.confirm).toHaveBeenCalled();
      expect(component.dialogRef.close).toHaveBeenCalled();
    });

    it('should call skip on click', () => {
      const skipBtn = fixture.debugElement.query(By.css('.mat-dialog-close-icon'));
      component.dialogRef = {
        close: jest.fn(),
      } as any;

      expect(skipBtn).toBeTruthy();
      skipBtn.nativeElement.click();
      expect(dialogData.actions.skip).toHaveBeenCalled();
      expect(component.dialogRef.close).toHaveBeenCalled();
    });
  });
});
