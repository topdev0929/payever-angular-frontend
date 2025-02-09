import { Observable } from 'rxjs';

export abstract class PeConnectionApi {

  abstract getAllConnections();
  abstract updateConnectionInstall(id: string): Observable<any>;
  abstract updateConnectionUnInstall(id: string): Observable<any>;
}
