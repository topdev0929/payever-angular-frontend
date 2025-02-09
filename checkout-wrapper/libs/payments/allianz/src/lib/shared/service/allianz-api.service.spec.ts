import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';
import { NodePaymentResponseInterface } from '@pe/checkout/types';

import { AllianzApiService } from './allianz-api.service';

describe('AllianzApiService', () => {
    let service: AllianzApiService;
    let httpTestingController: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                ...CommonImportsTestHelper(),
            ],
            providers: [
                ...CommonProvidersTestHelper(),
                AllianzApiService,
            ],
        });

        service = TestBed.inject(AllianzApiService);
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
