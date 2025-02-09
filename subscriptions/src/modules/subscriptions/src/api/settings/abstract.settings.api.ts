import { Observable } from 'rxjs';

export abstract class PeSettingsApi {

  abstract getBillingSubscriptionAccess(id: string): Observable<any>;
  abstract updateBillingSubscriptionAccessConfig(id: string, data: any): Observable<any>;
  abstract getBillingSubscriptionAccessIsLive(id: string): Observable<any>;
  abstract getAllDomains(planId: string): Observable<any>;
  abstract addDomain(domain: string): Observable<any>;
  abstract deleteDomain(domainId: string): Observable<any>;
  abstract checkDomain(domainId: string): Observable<any>;
  abstract validDomain(name: string): Observable<any>;
}
