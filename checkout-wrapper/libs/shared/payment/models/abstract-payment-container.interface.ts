import { Observable } from 'rxjs';

export interface AbstractPaymentContainer{
  nodeFormOptions$?: Observable<unknown>;
}
