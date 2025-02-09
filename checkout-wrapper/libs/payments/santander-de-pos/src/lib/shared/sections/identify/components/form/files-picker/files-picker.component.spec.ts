import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { importProvidersFrom } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, NgControl } from '@angular/forms';
import { MatButtonToggleGroupHarness } from '@angular/material/button-toggle/testing';
import { By } from '@angular/platform-browser';
import { Store } from '@ngxs/store';
import { MockComponents } from 'ng-mocks';
import { from } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

import { PaymentInquiryStorage } from '@pe/checkout/storage';
import {
  FlowState,
  PatchPaymentResponse,
  SetFlow,
} from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper, QueryChildByDirective } from '@pe/checkout/testing';
import { PaymentStatusEnum } from '@pe/checkout/types';

import { PaymentResponseWithStatus, flowWithPaymentOptionsFixture } from '../../../../../../test/fixtures';
import { DocsManagerService, DocumentSideEnum, PERSON_TYPE, PersonTypeEnum } from '../../../../../common';
import { IdentifyModule } from '../../../identify.module';
import { ImageCaptureComponent } from '../image-capture';

import { FilePickerComponent } from './files-picker.component';

describe('files-picker', () => {
  let store: Store;

  let component: FilePickerComponent;
  let fixture: ComponentFixture<FilePickerComponent>;
  let loader: HarnessLoader;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        importProvidersFrom(IdentifyModule),
        ...CommonProvidersTestHelper(),
        PaymentInquiryStorage,
        {
          provide: PERSON_TYPE,
          useValue: PersonTypeEnum.Customer,
        },
        { provide: NgControl, useValue: new FormControl() },
      ],
      declarations: [
        FilePickerComponent,
        MockComponents(ImageCaptureComponent),
      ],
    });
    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    const paymentResponse = PaymentResponseWithStatus(
      PaymentStatusEnum.STATUS_ACCEPTED, null
    );
    store.dispatch(new PatchPaymentResponse(paymentResponse));
    fixture = TestBed.createComponent(FilePickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  afterEach(() => {
    fixture?.destroy();
    jest.clearAllMocks();
  });


  describe('Constructor', () => {
    it('Should create an instance', () => {
      expect(component).toBeTruthy();
    });
  });


  describe('component', () => {
    it('should toggle document-type', (done) => {
      fixture.componentRef.setInput('nodeFormOptions', {
        identifications: [
          {
            label: 'name',
            value: 'name',
          },
          {
            label: 'passport',
            value: 'PASSPORT',
          },
        ],
      });
      fixture.detectChanges();

      const toggleDocumentType = jest.spyOn(component, 'toggleDocumentType');
      from(loader.getHarness(MatButtonToggleGroupHarness)).pipe(
        tap((g) => { expect(g).toBeTruthy() }),
        switchMap(g => g.getToggles()),
        tap((toggles) => { expect(toggles.length).toBe(2) }),
        switchMap(toggles => toggles[0].toggle()),
        tap(() => {
          expect(toggleDocumentType).toHaveBeenCalledWith('PASSPORT');
          const childEl = fixture.debugElement.queryAll(By.directive(ImageCaptureComponent));
          expect(childEl).toHaveLength(3);
          done();
        }),
      ).subscribe();
    });

    it('should call onFilePickedBase64 on filePicked', () => {
      const identificationType = 'PASSPORT';
      const side = DocumentSideEnum.Front;
      const flowId = store.selectSnapshot(FlowState.flowId);
      const addDocument = jest.spyOn(DocsManagerService.prototype, 'addDocument');
      const sendDocsRequired = jest.spyOn(component.sendDocsRequired, 'emit');
      const onFilePickedBase64 = jest.spyOn(component, 'onFilePickedBase64');
      const next = jest.spyOn(component['onFileChanged$'], 'next');
      const pickedFile = {
        base64: 'data:image/png;base64,BASE64DATA',
      };
      const { childEl } = QueryChildByDirective(fixture, ImageCaptureComponent);
      component.identificationType = identificationType;
      component.toggleDocumentType(identificationType);
      childEl.triggerEventHandler('filePicked', pickedFile);
      expect(onFilePickedBase64).toHaveBeenCalledWith(side, pickedFile, 'IDENTIFICATION');
      expect(addDocument).toHaveBeenCalledWith({
        type: 'png',
        filename: `customer-${identificationType}-${side}.png`,
        base64: pickedFile.base64,
        documentType: 'IDENTIFICATION',
      }, flowId, PersonTypeEnum.Customer, side);
      expect(sendDocsRequired).toHaveBeenCalledWith(true);
      expect(next).toHaveBeenCalledWith(true);
    });

    it('should call onFileRemove on fileRemove', () => {
      const side = DocumentSideEnum.Front;
      const flowId = store.selectSnapshot(FlowState.flowId);
      const deleteDocuments = jest.spyOn(DocsManagerService.prototype, 'deleteDocuments');
      const { childEl } = QueryChildByDirective(fixture, ImageCaptureComponent);
      const next = jest.spyOn(component['onFileChanged$'], 'next');
      childEl.triggerEventHandler('fileRemove', side);
      expect(deleteDocuments).toHaveBeenCalledWith(flowId, PersonTypeEnum.Customer, 'IDENTIFICATION', side);
      expect(next).toHaveBeenCalledWith(true);
    });


    it('should set identifications on nodeFormOptions', () => {
      const inputData = {
        identifications: [
          {
            label: 'passport',
            value: 'passport',
          },
          {
            label: 'ssn',
            value: 0,
          },
          {
            label: 'residency',
            value: false,
          },
        ],
      };
      fixture.componentRef.setInput('nodeFormOptions', inputData);
      expect(component.identifications).toEqual(inputData.identifications.slice().reverse());
    });

    it('should call onErrorTriggered', () => {
      const errText = 'test error';
     component.onErrorTriggered(errText);
      expect(component.errorMessage).toEqual(errText);
    });

  });
});
