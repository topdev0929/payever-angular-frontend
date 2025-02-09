import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { tap } from 'rxjs/operators';

import { LoaderService } from '@pe/checkout/core/loader';
import { CreateFlow, FlowState, GetSettings } from '@pe/checkout/store';
import {
  AddressInterface,
  AddressTypeEnum,
  PaymentMethodEnum,
  SalutationEnum,
} from '@pe/checkout/types';

interface PaymentMethodCreateFlowData {
  baseAddress: AddressInterface;
  testChannelSets: string[];
  stageChannelSets: string[];
  stubs: AddressInterface[];
  amount: number;

  filledAmount?: number;
  selectedChannelSet?: string;
  selectedStub?: AddressInterface;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'flow-generator',
  templateUrl: 'flow-generator.component.html',
  styles: [`
  .payment-title {
    text-transform: uppercase;
    margin: 12px 0;
  }
  .payment-row {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #dddddd;
  }
  `],
})
export class FlowGeneratorComponent {

  payments: { [key: string]: PaymentMethodCreateFlowData } = {};

  constructor(
    private router: Router,
    private loaderService: LoaderService,
    private store: Store,
  ) {
    this.loaderService.loaderGlobal = false;
    // Stubs:
    // https://docs.payever.org/resources/de/test-credentials/pos-santander-installments/
    this.payments = {
      [PaymentMethodEnum.IVY]: {
        baseAddress: this.makeBilling('DE'),
        testChannelSets: [
          '8eee0064-29ea-4cd1-919b-66fc1d3d8782',
          '60a27f53-a7bb-44ee-94e9-6931e23bf68a', //pos
          'ff63f00c-b088-4877-8567-5d3ef5ea8cae',
          '1d802abf-13da-47a4-8b46-02366250c6a9',
          '4b8d0b20-24e0-4af3-8707-42037023add7',
        ],
        stageChannelSets: [
          '64461f1b-4cf0-455f-90ba-2b36bf118c5e',
          '08e66cf9-d4d0-4786-87fe-04cb3def016d',
          'a07b9dd4-b3aa-4831-a44b-bbca583f2642',
          'faed78c0-0905-480f-9607-7fe9ba4cd2ba',
          '962eedac-cadd-11e7-a4f9-525400000108',
          '9d14d9c9-8f03-4daa-a478-57570ef4025a',
        ],
        stubs: [
          { firstName: 'Stub', lastName: 'In_progress' },
          { firstName: 'Stub', lastName: 'In_process' },
          { firstName: 'Stub', lastName: 'Accepted' },
          { firstName: 'Stub', lastName: 'Approved' },
          { firstName: 'Stub', lastName: 'Pending' },
          { firstName: 'Stub', lastName: 'Rejected' },
          { firstName: 'Stub', lastName: 'Declined' },
        ],
        amount: 1100,
      },
      [PaymentMethodEnum.SANTANDER_INSTALLMENT_NO]: {
        baseAddress: Object.assign(
          this.makeBilling('NO'),
          { socialSecurityNumber: '25048128184', phone: '90212048' },
        ),
        testChannelSets: [
          'cfb3434d-1a67-4353-97ff-df957a5dd035',
          'd3bbccd2-df26-41a0-90f5-593cdcbd119c',
        ],
        stageChannelSets: [
          '4a819a8a-b728-4b41-849b-49cc3e2f2e7a',
        ],
        stubs: [
          'Approved', 'Signed', 'Paid', 'Processing', 'Investpaid', 'Partlypaid', 'Manual', 'Application_not_created',
          'Rejected', 'Expired', 'Cancelled', 'Saved', 'Replaced', 'Invoiced',
        ].flatMap(a => [
          'Need_more_info_iir',
          'Need_more_info_dti',
          'Need_more_info_sifo',
          'Need_more_info_student_sifo',
        ].map(b => ({ firstName: 'Stub', lastName: `${b}:${a}` }))),
        amount: 13000,
      },
      [PaymentMethodEnum.SANTANDER_INVOICE_NO]: {
        baseAddress: Object.assign(
          this.makeBilling('NO'),
          { socialSecurityNumber: '25048128184', phone: '90212048' },
        ),
        testChannelSets: [
          'cfb3434d-1a67-4353-97ff-df957a5dd035',
        ],
        stageChannelSets: [
          '4a819a8a-b728-4b41-849b-49cc3e2f2e7a',
        ],
        stubs: [
          'Approved', 'Activated', 'Declined', 'Pending',
        ].map(a => ({ firstName: 'Stub', lastName: a })),
        amount: 13000,
      },
      [PaymentMethodEnum.SANTANDER_INSTALLMENT_DK]: {
        baseAddress: this.makeBilling('DK'),
        testChannelSets: [
          '1dbe2829-cf13-4381-8f0c-af9fde723a64',
          '9fadb445-a795-40a5-9600-5608b212f71d',
        ],
        stageChannelSets: [
          'fd65b8b7-9263-4510-9f4a-a2ef3ce5c7c3',
          '4e0e633c-6e7d-4d49-af73-bc91cf339d64',
        ],
        stubs: [
          'Pending', 'Control', 'Approved', 'Rejected', 'Signed', 'Shipped', 'Cancelled',
        ].map(a => ({ firstName: 'Stub', lastName: a })),
        amount: 7850,
      },
      [PaymentMethodEnum.SANTANDER_POS_INSTALLMENT_DK]: {
        baseAddress: this.makeBilling('DK'),
        testChannelSets: [
          'f61a5023-d410-40d0-9c7d-dcf1a6572c06',
        ],
        stageChannelSets: [
          'b4e5221c-1cf4-46ba-acbb-e46e33c6f959',
        ],
        stubs: [
          'Approved', 'Pending', 'Control', 'Rejected', 'Signed', 'Shipped', 'Cancelled',
        ].map(a => ({ firstName: 'Stub', lastName: a })),
        amount: 7850,
      },
      [PaymentMethodEnum.SANTANDER_INSTALLMENT_SE]: {
        baseAddress: Object.assign(this.makeBilling('SE'), { socialSecurityNumber: '888888888888' }),
        testChannelSets: [
          '5d4a1ff9-2072-4d74-bb9c-d625f4228a51',
          '5950bdc3-35e5-4257-b121-f11a263c1e4e',
        ],
        stageChannelSets: [
          '080db92c-9aca-42cd-b928-fb7717ec16b4',
        ],
        stubs: [
          'Accepted', 'Activated', 'Declined', 'Pending',
        ].map(a => ({ firstName: 'Stub', lastName: a })),
        amount: 13000,
      },
      [PaymentMethodEnum.INSTANT_PAYMENT]: {
        baseAddress: this.makeBilling('DE'),
        testChannelSets: [
          '1d802abf-13da-47a4-8b46-02366250c6a9',
          '4b8d0b20-24e0-4af3-8707-42037023add7',
        ],
        stageChannelSets: [
          '962eedac-cadd-11e7-a4f9-525400000108',
          'ab9b1a9d-80e1-4632-a66e-efc39fd64338',
        ],
        stubs: [],
        amount: 123,
      },
      [PaymentMethodEnum.CASH]: {
        baseAddress: this.makeBilling('DE'),
        testChannelSets: [
          '4b8d0b20-24e0-4af3-8707-42037023add7',
        ],
        stageChannelSets: [
          '962eedac-cadd-11e7-a4f9-525400000108',
          '9d14d9c9-8f03-4daa-a478-57570ef4025a',
        ],
        stubs: [
          { firstName: 'Stub', lastName: 'Approved' },
          { firstName: 'Stub', lastName: 'Pending' },
          { firstName: 'Stub', lastName: 'Rejected' },
        ],
        amount: 133,
      },
      [PaymentMethodEnum.ZINIA_BNPL]: {
        baseAddress: this.makeBilling('NL'),
        testChannelSets: [
          '1d802abf-13da-47a4-8b46-02366250c6a9',
          '6d416f19-b0a1-4f31-9d11-984e96acfffc',
        ],
        stageChannelSets: [
          '6c5aaefc-f91b-4aed-b9a4-e1acd2b23818',
          // '0b5f3995-0e7a-4bc0-9518-243d60615fd0', // ZINIA_POS
        ],
        stubs: [
          { firstName: 'Johan', lastName: 'Margaritalowlands' },
        ],
        amount: 350,
      },
      [PaymentMethodEnum.ZINIA_BNPL_DE]: {
        baseAddress: this.makeBilling('DE'),
        testChannelSets: [
          'ca0331c6-172d-4f69-916b-c06bb6fd4fb5',
          '1d802abf-13da-47a4-8b46-02366250c6a9',
          '6d416f19-b0a1-4f31-9d11-984e96acfffc',
        ],
        stageChannelSets: [
          'c3e4c623-15a5-4d9c-9053-6c434f98cd89',
          '64461f1b-4cf0-455f-90ba-2b36bf118c5e',
          'faed78c0-0905-480f-9607-7fe9ba4cd2ba',
          '42b43d1f-74ee-4c73-82f1-9e42c4ffa3c1',
          // '0b5f3995-0e7a-4bc0-9518-243d60615fd0', // ZINIA_POS
        ],
        stubs: [
          { firstName: 'Zinia', lastName: 'ZINIA_AP' },
          { firstName: 'Johan', lastName: 'Margaritalowlands' },
        ],
        amount: 350,
      },
      [PaymentMethodEnum.ZINIA_INSTALLMENT_DE]: {
        baseAddress: this.makeBilling('DE'),
        testChannelSets: [
          'ca0331c6-172d-4f69-916b-c06bb6fd4fb5',
          '1d802abf-13da-47a4-8b46-02366250c6a9',
          '6d416f19-b0a1-4f31-9d11-984e96acfffc',
        ],
        stageChannelSets: [
          '64461f1b-4cf0-455f-90ba-2b36bf118c5e',
          'faed78c0-0905-480f-9607-7fe9ba4cd2ba',
          '42b43d1f-74ee-4c73-82f1-9e42c4ffa3c1',
          // '0b5f3995-0e7a-4bc0-9518-243d60615fd0', // ZINIA_POS
        ],
        stubs: [
          { firstName: 'Zinia', lastName: 'ZINIA_AP' },
          { firstName: 'Johan', lastName: 'Margaritalowlands' },
        ],
        amount: 350,
      },
      [PaymentMethodEnum.ZINIA_POS_DE]: {
        baseAddress: this.makeBilling('DE'),
        testChannelSets: [
          '046593d9-cacd-4395-987c-c05c2db528ac',
        ],
        stageChannelSets: [
          '3bd30155-1f7f-4c80-8e31-7a124e271883',
          '0b5f3995-0e7a-4bc0-9518-243d60615fd0',
        ],
        stubs: [
          { firstName: 'Zinia', lastName: 'ZINIA_AP' },
        ],
        amount: 350,
      },
      [PaymentMethodEnum.PAYPAL]: {
        baseAddress: this.makeBilling('DE'),
        testChannelSets: [
          '4b8d0b20-24e0-4af3-8707-42037023add7',
        ],
        stageChannelSets: [],
        stubs: [],
        amount: 333,
      },
      [PaymentMethodEnum.SANTANDER_INSTALLMENT_AT]: {
        baseAddress: this.makeBilling('AT'),
        testChannelSets: [
          '4b8d0b20-24e0-4af3-8707-42037023add7',
        ],
        stageChannelSets: ['e9183056-ceae-40de-a972-5e689051c726'],
        stubs: [],
        amount: 333,
      },
      [PaymentMethodEnum.SANTANDER_INSTALLMENT_FI]: {
        baseAddress: this.makeBilling('FI'),
        testChannelSets: [
          'b2f99c8e-6e85-4ee4-8e36-ea0cf063830b',
          '1d802abf-13da-47a4-8b46-02366250c6a9',
        ],
        stageChannelSets: ['ab9b1a9d-80e1-4632-a66e-efc39fd64338'],
        stubs: [
          { firstName: 'Stub', lastName: 'Accepted' },

        ],
        amount: 5000,
      },
      [PaymentMethodEnum.SANTANDER_INSTALLMENT]: {
        baseAddress: this.makeBilling('DE'),
        testChannelSets: [
          '04944f4e-2d75-4657-9a14-8c20cf9e313a',
        ],
        stageChannelSets: [
          '9d14d9c9-8f03-4daa-a478-57570ef4025a',
        ],
        stubs: [
          { firstName: 'Stub', lastName: 'Approved' },
          { firstName: 'Stub', lastName: 'In_progress' },
          { firstName: 'Stub', lastName: 'In_process' },
          { firstName: 'Stub', lastName: 'Declined' },
          { firstName: 'Stub', lastName: 'Cancelled' },
          { firstName: 'Stub', lastName: 'In_decision' },
        ],
        amount: 1500,
      },
      [PaymentMethodEnum.SANTANDER_FACTORING_DE]: {
        baseAddress: this.makeBilling('DE'),
        testChannelSets: [
          'ff63f00c-b088-4877-8567-5d3ef5ea8cae',
          '1d802abf-13da-47a4-8b46-02366250c6a9',
          '121678b6-79f3-4f29-adb5-325584d2ca3e',
          '4b8d0b20-24e0-4af3-8707-42037023add7',
        ],
        stageChannelSets: [
          'ab9b1a9d-80e1-4632-a66e-efc39fd64338',
          '9d14d9c9-8f03-4daa-a478-57570ef4025a',
        ],
        stubs: [
          { firstName: 'Grün', lastName: 'Ampel' },
          { firstName: 'Stub', lastName: 'Success' },
          { firstName: 'Stub', lastName: 'Neutral' },
          { firstName: 'Stub', lastName: 'Waiting_bank' },
          { firstName: 'Stub', lastName: 'Rejected_bank' },
        ],
        amount: 200,
      },
      [PaymentMethodEnum.SANTANDER_POS_INSTALLMENT]: {
        baseAddress: this.makeBilling('DE'),
        testChannelSets: [
          'b4c7e6a7-5f8c-4845-9bae-22e15567acb9',
          '36797083-c4af-441e-8ade-9b85da8281b7',
          'e5503d0d-0e2e-4998-87a8-647f05dba675',
          'de66a1a4-3b62-4fad-9b61-adadb1747fa6',
          '6dfeb1e9-62ca-4ca3-8d66-798c9bda1801',
          'ec474c80-6095-453e-9105-071cbdd485c9',
          '04944f4e-2d75-4657-9a14-8c20cf9e313a',
        ],
        stageChannelSets: [
          'b5e33da4-a7f9-45f5-9ee5-7c269a412603',
          '626f5d24-e1d7-4bb7-8b53-73e44239c3dd',
          'cfe0b5f1-bdd9-4f8b-b5e9-a442b6a55223',
          'd5fc8aac-66f7-4544-aec3-87d61b5077c7',
        ],
        stubs: [
          { firstName: 'Stub', lastName: 'Accepted' },
          { firstName: 'Stub', lastName: 'Declined' },
          { firstName: 'Stub', lastName: 'Cancelled' },
        ],
        amount: 1500,
      },
      [PaymentMethodEnum.SANTANDER_INSTALLMENT_UK]: {
        baseAddress: this.makeBilling('GB'),
        testChannelSets: [
          '4e5794c4-d3c9-45be-b10c-7d7eb5c76c9a',
        ],
        stageChannelSets: [
          'dc98d7c4-7ba6-4d05-b35c-51a2e1eb6b30',
          'e520e873-8f2e-410a-ab18-84723ca80268',
          'dc98d7c4-7ba6-4d05-b35c-51a2e1eb6b30',
        ],
        stubs: [
          { firstName: 'Stub', lastName: 'Accepted' },
          { firstName: 'Stub', lastName: 'Declined' },
          { firstName: 'Stub', lastName: 'Denied' },
          { firstName: 'Stub', lastName: 'Cancelled' },
        ],
        amount: 5000,
      },
      [PaymentMethodEnum.SANTANDER_POS_INSTALLMENT_UK]: {
        baseAddress: this.makeBilling('GB'),
        testChannelSets: [
          '8dfc1913-56dc-4135-8e4c-0d9327504f3f',
        ],
        stageChannelSets: [
          'e4fd88b9-d55c-42ff-b36e-aa2c760c6622',
        ],
        stubs: [
          { firstName: 'Stub', lastName: 'Accepted' },
          { firstName: 'Stub', lastName: 'Declined' },
          { firstName: 'Stub', lastName: 'Denied' },
          { firstName: 'Stub', lastName: 'Cancelled' },
        ],
        amount: 5000,
      },
      [PaymentMethodEnum.SANTANDER_INVOICE_DE]: {
        baseAddress: this.makeBilling('DE'),
        testChannelSets: [
          '1d802abf-13da-47a4-8b46-02366250c6a9',
        ],
        stageChannelSets: [
          '9d14d9c9-8f03-4daa-a478-57570ef4025a',
          '96d52f0f-5644-461e-922a-cb06b5e81708',
        ],
        stubs: [
          { firstName: 'Stub', lastName: 'Approved' },
          { firstName: 'Stub', lastName: 'Declined' },
          { firstName: 'Stub', lastName: 'Denied' },
          { firstName: 'Stub', lastName: 'Cancelled' },
        ],
        amount: 300,
      },
    };
  }

  get keys(): PaymentMethodEnum[] {
    return Object.keys(this.payments) as PaymentMethodEnum[];
  }

  getInputValue($event: any): number {
    return $event?.target?.value;
  }

  onCreate(data: PaymentMethodCreateFlowData): void {
    if (data.selectedChannelSet) {
      const createData = {
        billingAddress: { ...data.baseAddress, ...data.selectedStub },
        channelSetId: data.selectedChannelSet,
        amount: data.amount || data.filledAmount,
        reference: `yg${Math.random().toString().substring(8)}`,
      };

      this.store.dispatch([
        new CreateFlow(createData),
        new GetSettings(data.selectedChannelSet, GetSettings.bypassCache),
      ]).pipe(
        tap(() => {
          const flow = this.store.selectSnapshot(FlowState.flow);
          this.router.navigate(['/pay', flow.id]);
        }),
      ).subscribe();
    }
  }

  private makeBilling(country: string): AddressInterface {
    return {
      city: 'SomeCity',
      country,
      email: 'customer2000@email.de',
      firstName: 'Test',
      lastName: 'Test',
      phone: PHONE_BY_COUNTRY[country] || `+49171123${Math.random().toString().slice(2, 6)}`,
      salutation: SalutationEnum.SALUTATION_MR,
      fullAddress: 'SomeStreet 2000, SomeCity 12345' + country,
      street: 'SomeStreet 2000',
      streetName: 'SomeStreet',
      streetNumber: '2000',
      type: AddressTypeEnum.BILLING,
      zipCode: '12345',
    };
  }
}


const PHONE_BY_COUNTRY: { [country: string]: string } = {
  SE: '+46731298952',
  DK: '+45171123456',
};
