import { Overlay } from '@angular/cdk/overlay';
import { TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogState } from '@angular/material/dialog';

import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';
import { PaymentHelperService } from '@pe/checkout/utils';

import { DataInterface, HelperDialogComponent } from '../components/helper-dialog/helper-dialog.component';

import { FinishDialogService } from './finish-dialog.service';

describe('FinishDialogService', () => {
  let service: FinishDialogService;
  let paymentHelperService: PaymentHelperService;

  const matDialogData: DataInterface = {
    onClose: jest.fn(),
    template: null,
    buttons: [
      { title: 'Submit', classes: 'class-submit', click: jest.fn(), disabled: false, dismiss: false, order: 0 },
      { title: 'Close', classes: 'class-cancel', click: 'close', disabled: true, dismiss: false, order: 1 },
    ],
  };

  const getState = jest.fn();
  const close = jest.fn();
  const componentInstance = {
    data: matDialogData,
    cdr: {
      detectChanges: jest.fn(),
    },
  };
  const matDialog = {
    open: jest.fn().mockReturnValue({
      getState,
      close,
      componentInstance,
    }),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [...CommonImportsTestHelper()],
      providers: [
        ...CommonProvidersTestHelper(),
        FinishDialogService,
        PaymentHelperService,
        {
          provide: MatDialog,
          useValue: matDialog,
        },
        {
          provide: Overlay,
          useValue: {
            scrollStrategies: {
              block: jest.fn().mockReturnValue('mock-scroll-strategy'),
            },
          },
        },
      ],
    });

    paymentHelperService = TestBed.inject(PaymentHelperService);
    service = TestBed.inject(FinishDialogService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });
  });

  describe('open', () => {
    it('should create new dialogRef', () => {
      service.open(matDialogData.template, matDialogData.buttons, matDialogData.onClose);
      expect(matDialog.open).toHaveBeenCalledWith(HelperDialogComponent, {
        autoFocus: false,
        disableClose: true,
        panelClass: ['dialog-overlay-panel', 'pe-checkout-bootstrap', 'pe-checkout-finish-modal-panel'],
        backdropClass: [
          'pe-checkout-finish-modal-backdrop',
          'cdk-overlay-backdrop',
          'cdk-overlay-dark-backdrop',
          'cdk-overlay-backdrop-showing',
        ],
        data: {
          template: matDialogData.template,
          buttons: matDialogData.buttons,
          onClose: matDialogData.onClose,
        },
        scrollStrategy: 'mock-scroll-strategy',
      });
    });

    it('should handle if ref already true', () => {
      service.open(matDialogData.template, matDialogData.buttons, matDialogData.onClose);
      jest.clearAllMocks();
      service.open(matDialogData.template, matDialogData.buttons, matDialogData.onClose);
      expect(matDialog.open).not.toHaveBeenCalled();
    });
  });

  describe('close', () => {
    let openEmbedFinishNext: jest.SpyInstance;
    beforeEach(() => {
      openEmbedFinishNext = jest.spyOn(paymentHelperService.openEmbedFinish$, 'next');
    });

    it('should return', () => {
      service.disableHideOnNextNavigate();
      service.close();
      expect(openEmbedFinishNext).not.toHaveBeenCalled();
      expect(close).not.toHaveBeenCalled();
    });

    it('should handle empty dialogRef', () => {
      service.close();
      expect(openEmbedFinishNext).toHaveBeenCalled();
      expect(close).not.toHaveBeenCalled();
    });

    it('should close if dialog open', () => {
      service.open(matDialogData.template, matDialogData.buttons, matDialogData.onClose);

      getState.mockReturnValue(MatDialogState.OPEN);
      service.close();
      expect(openEmbedFinishNext).toHaveBeenCalled();
      expect(close).toHaveBeenCalled();
    });
  });

  describe('updateButtons', () => {
    it('should update buttons', () => {
      const updatedButtons = [...matDialogData.buttons, { title: 'Submit' }];
      service.open(matDialogData.template, matDialogData.buttons, matDialogData.onClose);
      expect(componentInstance.data.buttons).toEqual(matDialogData.buttons);

      service.updateButtons(updatedButtons);
      expect(componentInstance.data.buttons).toEqual(updatedButtons);
      expect(componentInstance.cdr.detectChanges).toHaveBeenCalled();
    });

    it('should handle empty dialogRef', () => {
      service.updateButtons([]);
      expect(componentInstance.data.buttons).toEqual(matDialogData.buttons);
      expect(componentInstance.cdr.detectChanges).not.toHaveBeenCalled();
    });
  });
});
