import { TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { MockProvider } from 'ng-mocks';
import { of } from 'rxjs';
import { take, tap } from 'rxjs/operators';

import { NodeFlowService } from '@pe/checkout/node-api';
import { FlowState, SetFlow } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';
import { PaymentTerms } from '@pe/checkout/types';

import { flowWithPaymentOptionsFixture } from '../../test/fixtures';

import { TermsService } from './terms.service';
describe('TermsService', () => {
  let store: Store;

  let instance: TermsService;
  let nodeFlowService: NodeFlowService;


  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        TermsService,
        MockProvider(NodeFlowService),
      ],
    });
    instance = TestBed.inject(TermsService);
    nodeFlowService = TestBed.inject(NodeFlowService);

    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    it('Should create an instance', () => {
      expect(instance).toBeTruthy();
    });
  });

  describe('service', () => {
    it('Should return terms', (done) => {
      const flow = store.selectSnapshot(FlowState.flow);
      const paymentTerms: PaymentTerms = {
        consents: [
          {
            documentId: 'document-id',
            metadata: {
              assetsLinks: {
                'pdf-link': 'http://assets-link',
                'mail': 'mailto@domain',
              },
              poEditorKey: 'po-editor-key',
              poEditorText: 'po-editor-text',
            },
            required: true,
            sortOrder: 1,
            text: 'term-text',
            title: 'term-title',
          },
        ],
        policies: [],
        terms: [],
      };
      const getTerms = jest.spyOn(nodeFlowService, 'getTerms')
        .mockReturnValue(of(paymentTerms));
      instance.getTerms(flow.id).pipe(
        take(1),
        tap((res) => {
          expect(res).toMatchObject({
            consents: [{ label: 'term-text', required: true, documentId: 'document-id' }],
          });
          done();
        }),
      ).subscribe();
      expect(getTerms).toHaveBeenCalledWith(flow.connectionId);
    });
  });
});

