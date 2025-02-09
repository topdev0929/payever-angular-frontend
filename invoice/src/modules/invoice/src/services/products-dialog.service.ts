import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
@Injectable()
export class ProductsDialogService {
  private saveStatusSubject = new Subject();
  currentStatus = this.saveStatusSubject.asObservable();

  constructor() {}

  changeSaveStatus(isSaved: boolean) {
    this.saveStatusSubject.next(isSaved);
  }
}
