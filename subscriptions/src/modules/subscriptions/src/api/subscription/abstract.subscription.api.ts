import { Observable } from 'rxjs';

import { ProgramEntity } from './subscription.api.interface';

export abstract class PeSubscriptionApi {
  abstract getAllPlans(): Observable<ProgramEntity[]>;
  abstract addPlan(data: any): Observable<any>;
  abstract editPlan(id: string, data: any): Observable<any>;
  abstract getPlan(id: string);
  abstract deletePlans(ids: string[]): Observable<any>;
}
