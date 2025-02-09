import { Injectable } from "@angular/core";
import { EnvService } from "@pe/common";
import { BusinessInterface } from "@pe/common/micro/types/business";
import { Observable } from "rxjs";

Injectable()
export class ShopEnvService extends EnvService {
    businessId: string;
    businessData: BusinessInterface;
    shopId: string;
    businessName: string;
    businessData$: Observable<BusinessInterface>;
    businessId$: Observable<string>
}