import { TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';

import { SetFlow } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';

import { flowWithPaymentOptionsFixture } from '../../../test';
import { DocumentSideEnum, PersonTypeEnum } from '../types';

import { DocsManagerService, DocumentDataInterface, SavedDocumentInterface } from './docs-manager.service';

describe('DocsManagerService', () => {
  let service: DocsManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),



        DocsManagerService,
      ],
    });

    const store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));

    service = TestBed.inject(DocsManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('addDocument', () => {
    it('should add a document to the list', () => {
      const document: DocumentDataInterface = {
        type: 'jpg',
        filename: 'example.jpg',
        base64: 'mocked-base64-data',
        documentType: 'IDENTIFICATION',
      };
      const flowId = '123';
      const person = PersonTypeEnum.Customer;
      const side = DocumentSideEnum.Front;

      service.addDocument(document, flowId, person, side);

      const savedDocument = service['documents'][0];
      expect(savedDocument.document).toBe(document);
      expect(savedDocument.flowId).toBe(flowId);
      expect(savedDocument.person).toBe(person);
      expect(savedDocument.side).toBe(side);
    });
  });

  describe('deleteDocuments', () => {
    it('should delete documents based on flowId, person, and side', () => {
      const flowId = '123';
      const person = PersonTypeEnum.Customer;
      const side = DocumentSideEnum.Front;
      const documentType = 'IDENTIFICATION';

      service['documents'] = [
        {
          document: {
            type: 'jpg',
            filename: 'example.jpg',
            base64: 'mocked-base64-data',
            documentType: 'IDENTIFICATION',
          }, flowId, person, side,
        },
        {
          document: {
            type: 'png',
            filename: 'example.png',
            base64: 'mocked-base64-data',
            documentType: 'IDENTIFICATION',
          }, flowId, person, side,
        },
      ];

      service.deleteDocuments(flowId, person, documentType, side);

      expect(service['documents'].length).toBe(0);
    });
  });

  describe('getDocuments', () => {
    it('should return documents based on flowId, person, and side', () => {
      const flowId = '123';
      const person = PersonTypeEnum.Customer;
      const side = DocumentSideEnum.Front;
      const documentType = 'IDENTIFICATION';

      const expectedDocuments: DocumentDataInterface[] = [
        { type: 'jpg', filename: 'example.jpg', base64: 'mocked-base64-data', documentType: 'IDENTIFICATION' },
        { type: 'png', filename: 'example.png', base64: 'mocked-base64-data', documentType: 'IDENTIFICATION' },
      ];

      service['documents'] = [
        { document: expectedDocuments[0], flowId, person, side },
        { document: expectedDocuments[1], flowId, person, side },
      ];

      const result = service.getDocuments(flowId, person, documentType, side);

      expect(result).toEqual(expectedDocuments);
    });

    it('should return an empty array if no matching documents are found', () => {
      const flowId = '123';
      const person = PersonTypeEnum.Customer;
      const documentType = 'IDENTIFICATION';

      const result = service.getDocuments(flowId, person, documentType);

      expect(result).toEqual([]);
    });
  });

  describe('getAllDocuments', () => {
    it('should return all documents based on flowId', () => {
      const flowId = '123';

      const expectedDocuments: DocumentDataInterface[] = [
        { type: 'jpg', filename: 'example.jpg', base64: 'mocked-base64-data', documentType: 'IDENTIFICATION' },
        { type: 'png', filename: 'example.png', base64: 'mocked-base64-data', documentType: 'IDENTIFICATION' },
      ];

      service['documents'] = [
        { document: expectedDocuments[0], flowId, side: DocumentSideEnum.Back, person: PersonTypeEnum.Customer },
        { document: expectedDocuments[1], flowId, side: DocumentSideEnum.Front, person: PersonTypeEnum.Customer },
      ] as SavedDocumentInterface[];

      const result = service.getAllDocuments(flowId);

      expect(result).toEqual(expectedDocuments);
    });

    it('should return an empty array if no documents are found for the given flowId', () => {
      const flowId = '123';

      const result = service.getAllDocuments(flowId);

      expect(result).toEqual([]);
    });
  });
});
