import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';

import { DialogService } from '@pe/checkout/dialog';
import { CommonImportsTestHelper, CommonProvidersTestHelper, QueryChildByDirective } from '@pe/checkout/testing';

import { AdditionalStepsModule } from '../../additional-steps.module';
import { ImageCaptureComponent } from '../image-capture';

import { DocumentDataInterface, UploadDocumentsComponent } from './upload-documents.component';

describe('UploadDocumentsComponent', () => {
  let component: UploadDocumentsComponent;
  let fixture: ComponentFixture<UploadDocumentsComponent>;
  const overlayData = {
    close: jest.fn(),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
        AdditionalStepsModule,
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        DialogService,
        {
          provide: MAT_DIALOG_DATA,
          useValue: overlayData,
        },
      ],
      declarations: [
        UploadDocumentsComponent,
      ],
    });

    fixture = TestBed.createComponent(UploadDocumentsComponent);
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
    it('cancel', () => {
      const backBtn = fixture.debugElement.query(By.css('.back-button'));
      backBtn.nativeElement.click();
      expect(overlayData.close).toBeCalled();
    });
    it('done', () => {
      const doneBtn = fixture.debugElement.query(By.css('.done-button'));
      doneBtn.nativeElement.click();
      component.onFilePickedBase64({
        base64: 'data:image/png;base64,BASE64DATA',
        fileName: 'filename',
      });
      const expected: DocumentDataInterface[] = [
        {
          base64: 'data:image/png;base64,BASE64DATA',
          filename: 'filename',
          type: 'png',
        },
      ];
      expect(overlayData.close).toBeCalledWith(expected);
    });

    it('should use a default name for files', () => {
      component.onFilePickedBase64({
        base64: 'data:image/png;base64,BASE64DATA',
        fileName: '',
      });
      const expected: DocumentDataInterface[] = [
        {
          base64: 'data:image/png;base64,BASE64DATA',
          filename: expect.stringContaining('1.png'),
          type: 'png',
        },
      ];
      const doneBtn = fixture.debugElement.query(By.css('.done-button'));
      doneBtn.nativeElement.click();
      expect(overlayData.close).toBeCalledWith(expected);
    });

    it('should show errors', () => {
      fixture.detectChanges();
      const { child } = QueryChildByDirective(fixture, ImageCaptureComponent);
      const message = 'error message';
      child.errorTriggered.next(message);
      const error = fixture.debugElement.query(By.css('.error-message'));
      expect(error).toBeTruthy();
      fixture.detectChanges();
      expect(error.nativeElement.innerHTML).toBe(message);
    });

    it('should remove selected on click', () => {
      const doneBtn = fixture.debugElement.query(By.css('.done-button'));
      doneBtn.nativeElement.click();
      component.onFilePickedBase64({
        base64: 'data:image/png;base64,BASE64DATA',
        fileName: 'filename',
      });
      fixture.detectChanges();
      const removeBtn = fixture.debugElement.query(By.css('.remove'));
      expect(removeBtn).toBeTruthy();
      removeBtn.nativeElement.click();
      doneBtn.nativeElement.click();
      expect(overlayData.close).toBeCalledWith([]);
    });

    it('should remove selected on click - single file mode', () => {
      fixture.componentRef.setInput('multipleFiles', false);
      const doneBtn = fixture.debugElement.query(By.css('.done-button'));
      doneBtn.nativeElement.click();
      component.onFilePickedBase64({
        base64: 'data:image/png;base64,BASE64DATA',
        fileName: 'filename',
      });
      fixture.detectChanges();
      const { child } = QueryChildByDirective(fixture, ImageCaptureComponent);
      child.fileRemove.emit();
      doneBtn.nativeElement.click();
      expect(overlayData.close).toBeCalledWith([]);
    });
  });
});
