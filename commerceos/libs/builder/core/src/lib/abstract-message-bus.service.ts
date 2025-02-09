import { Observable } from 'rxjs';

/** @deprecated use ofActionDispatched from ngxs */
export abstract class MessageBus {

  abstract emit<T>(event: string, payload: T): void;

  abstract listen<T>(event: string): Observable<T>;
}
