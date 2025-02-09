import { Injectable } from "@angular/core";
import { EnvService } from "@pe/common";
import { BusinessInterface } from "@pe/common/micro/types/business";
import { Observable } from "rxjs";

Injectable()
export class InvoiceEnvService extends EnvService {
  businessId: string;
  businessData: BusinessInterface;
  invoiceId: string;
  applicationId: string;
  shopId: string;
  businessName: string;
  businessId$: Observable<string>;
  businessData$: Observable<BusinessInterface>
}
