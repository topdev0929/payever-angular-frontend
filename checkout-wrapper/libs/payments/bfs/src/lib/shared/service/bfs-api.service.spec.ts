import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';
import { NodePaymentResponseInterface } from '@pe/checkout/types';

import { BfsApiService } from './bfs-api.service';

describe('BfsApiService', () => {
    let service: BfsApiService;
    let httpTestingController: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                ...CommonImportsTestHelper(),
            ],
            providers: [
                ...CommonProvidersTestHelper(),
                BfsApiService,
            ],
        });

        service = TestBed.inject(BfsApiService);
        httpTestingController = TestBed.inject(HttpTestingController);
    });


    afterEach(() => {
        httpTestingController.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should send a POST request to the correct URL and return the response', () => {
        const connectionId = '123';
        const paymentId = '456';

        const expectedUrl = `${service['env'].thirdParty.payments}/api/connection/${connectionId}/action/get-payment`;

        const mockResponse = {
            payment: {},
        } as NodePaymentResponseInterface<any>;

        service.getPayment(connectionId, paymentId).subscribe((response) => {
            expect(response).toEqual(mockResponse);
        });

        const req = httpTestingController.expectOne(expectedUrl);
        expect(req.request.method).toEqual('POST');
        expect(req.request.body).toEqual({ paymentId });

        req.flush(mockResponse);
    });

});
