import { Injectable } from '@angular/core';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';

import { EditTransactionStorageService } from '@pe/checkout/api/edit-transaction';
import { StorageService } from '@pe/checkout/storage';
import { FlowState } from '@pe/checkout/store';
import { FlowInterface, PaymentMethodEnum } from '@pe/checkout/types';

/**
  * We use this service for communication through storage with cosf.
  * When in transactions app the /cancel-signing-request action does not take place,
  * we save it in storage so that when the transaction is edited we can do /remove-signed-status
*/

@Injectable()
export class EditFinishStorageService {
  @SelectSnapshot(FlowState.flow) public flow: FlowInterface;
  @SelectSnapshot(FlowState.paymentMethod) public paymentMethod: PaymentMethodEnum;

  get transactionId(): string {
    return this.editTransactionStorageService.getTransactionId(this.flow.id, this.paymentMethod);
  }

  constructor (
    private editTransactionStorageService: EditTransactionStorageService,
    private storage: StorageService
  ) {
  }

  public getEditCancelSigningRequest(): any {
    return JSON.parse(this.storage.get(this.makeKey()))?.cancelSigningRequest ?? true;
  }

  public removeEditCancelSigningRequest(): void {
    this.storage.remove(this.makeKey());
  }

  private makeKey(): string {
    return `pe.transactions.${this.flow.businessId}.${this.transactionId}.action.edit`;
  }
}
