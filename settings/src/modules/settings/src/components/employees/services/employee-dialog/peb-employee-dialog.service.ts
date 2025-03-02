import { HttpEvent, HttpEventType, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BlobCreateResponse, MediaContainerType, MediaService } from '@pe/media';
import { Observable, of, Subject, zip } from 'rxjs';
import { takeUntil } from 'rxjs/internal/operators';
import { catchError, filter } from 'rxjs/operators';
import { AppInterface } from '../../../../misc/interfaces';
import { ApiService } from '../../../../services';
import { AbstractComponent } from '../../../abstract';

@Injectable()
export class PebEmployeeDialogService extends AbstractComponent {

  constructor(
    private mediaService: MediaService,
    private apiService: ApiService,
  ) {
    super();
  }

  getImageBlobName$(businessId: string, mediaType: MediaContainerType, file: File): Observable<string> {
    const resultSubject$ = new Subject<string>();

    this.mediaService.createBlobByBusiness(businessId, mediaType, file)
      .pipe(
        filter((event: HttpEvent<BlobCreateResponse>) => event.type === HttpEventType.Response),
        takeUntil(this.destroyed$),
      ).subscribe((blobCreateResponseHttpEvent: HttpResponse<BlobCreateResponse>) => {
        const imageBlob = blobCreateResponseHttpEvent?.body;

        const imageBlobName = imageBlob?.blobName || null;

        resultSubject$.next(imageBlobName);
        resultSubject$.complete();
      });

    return resultSubject$.asObservable();
  }

  getInstalledAppsAndAcls$(businessId: string, employeeId?: string): Observable<[AppInterface[], any[]]> {
    const result$ = new Subject<[AppInterface[], any[]]>();
    const apps$ = this.apiService.getBusinessApps(businessId);
    const acls$ = employeeId
      ? this.apiService.getBusinessEmployeeAcls(businessId, employeeId).pipe(catchError(() => of([])))
      : of([]);

    zip(apps$, acls$)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(([apps, acls]) => {
        const installedApp = apps.filter(app => app.installed);

        result$.next([installedApp, acls]);
        result$.complete();
      });

    return result$.asObservable();
  }

  getInstalledAppsAndAclsGroups$(businessId: string, groupId?: string): Observable<[AppInterface[], any[]]> {
    const result$ = new Subject<[AppInterface[], any[]]>();
    const apps$ = this.apiService.getBusinessApps(businessId);
    const acls$ = groupId
      ? this.apiService.getBusinessGroupAcls(businessId, groupId).pipe(catchError(() => of([])))
      : of([]);

    zip(apps$, acls$)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(([apps, acls]) => {
        const installedApp = apps.filter(app => app.installed);

        result$.next([installedApp, acls]);
        result$.complete();
      });

    return result$.asObservable();
  }
}
