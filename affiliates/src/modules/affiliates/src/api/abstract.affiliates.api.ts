import { Observable } from 'rxjs';

export abstract class PeAffiliatesApi {
  abstract getPrograms(): Observable<any[]>;

  abstract deletePrograms(programIds: string[]): void;
}
