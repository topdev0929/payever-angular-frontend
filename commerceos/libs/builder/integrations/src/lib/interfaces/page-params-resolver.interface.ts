import { Observable } from 'rxjs';

export abstract class PebPageParamsResolver {
  abstract getParams(): Observable<any>;
}
