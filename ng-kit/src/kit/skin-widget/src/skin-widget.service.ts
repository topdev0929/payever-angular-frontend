import { Injectable } from '@angular/core';
import { Observable ,  Subject } from 'rxjs';

@Injectable()
export class SkinWidgetService {

  private fileUploadingSubject: Subject<boolean> = new Subject();
  private fileUploadingFailedSubject: Subject<boolean> = new Subject();

  fileUploading$(): Observable<boolean> {
    return this.fileUploadingSubject.asObservable();
  }

  fileUploadingFailed$(): Observable<boolean> {
    return this.fileUploadingFailedSubject.asObservable();
  }

  setFileUploadingState(isLoading: boolean): void {
    this.fileUploadingSubject.next(isLoading);
  }

  setFileUploadingFailedState(isFailed: boolean): void {
    this.fileUploadingFailedSubject.next(isFailed);
  }

}
