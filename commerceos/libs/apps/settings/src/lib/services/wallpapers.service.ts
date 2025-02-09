import { HttpEvent } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { Observable, of, Subject, throwError, zip, EMPTY } from 'rxjs';
import { catchError, switchMap, takeUntil } from 'rxjs/operators';

import { BlobCreateResponse, MediaContainerType, MediaService } from '@pe/media';

import { OwnerTypesEnum } from '../misc/enum';

import { ApiService, BusinessProductWallpaperInterface, WallpaperDataInterface } from './api.service';
import { BusinessEnvService } from './env.service';

@Injectable()
export class PebWallpapersService implements OnDestroy {

  mediaContainerType = MediaContainerType.Wallpapers;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private apiService: ApiService,
    private envService: BusinessEnvService,
    private mediaService: MediaService,
  ) {
  }

  get businessId() {
    return this.envService.businessUuid;
  }

  loadAllWallpapers(page, limit): Observable<WallpaperDataInterface[]> {
    return this.apiService.getAllWallpapers(page, limit);
  }

  loadWallpapersTree(): Observable<BusinessProductWallpaperInterface[]> {
    return this.apiService.getWallpaperTree();
  }

  loadWallpaperByCode(code, page, limit): Observable<WallpaperDataInterface[]> {
    return this.apiService.getWallpapersByCode(code, page, limit);
  }

  searchWallpaper(searchItems, navId, page, limit): Observable<WallpaperDataInterface[]> {
    return this.apiService.searchWallpaper(searchItems, page, limit, navId);
  }

  loadWallpapers(page, limit): Observable<any> {
    return this.apiService.getAllWallpapers(page, limit)
      .pipe(
        takeUntil(this.destroy$),
        switchMap((galleryWallpapers) => {
          return zip(of(galleryWallpapers),
            this.envService.ownerType === OwnerTypesEnum.Personal
              ? this.apiService.getMyPersonalWallpapers()
              : this.apiService.getMyBusinessWallpapers(this.envService.businessUuid),
          );
        }),
      );
  }

  setWallpaper(wallpaper): Observable<Object> {
    if (this.envService.ownerType === OwnerTypesEnum.Personal) {
      return this.apiService.setPersonalWallpaper(wallpaper);
    } else {
      return this.apiService.setBusinessWallpaper(this.businessId, wallpaper);
    }
  }

  public postImageBlob = (file: File): Observable<HttpEvent<BlobCreateResponse>> => {
    if (this.envService.ownerType === OwnerTypesEnum.Business) {
      return this.mediaService.createBlobByBusiness(this.envService.businessUuid, this.mediaContainerType, file);
    } else if (this.envService.ownerType === OwnerTypesEnum.Personal) {
      return this.mediaService.createBlobByUser(this.envService.userUuid, this.mediaContainerType, file);
    }
  };

  uploadWallpaper(data: WallpaperDataInterface): Observable<Object> {
    let wallpaperUpload$: Observable<Object> = EMPTY;

    if (this.envService.ownerType === OwnerTypesEnum.Business) {
      wallpaperUpload$ = this.apiService.addBusinessWallpaper(this.envService.businessUuid, data);
    } else if (this.envService.ownerType === OwnerTypesEnum.Personal) {
      wallpaperUpload$ = this.apiService.addPersonalWallpaper(data);
    }

    return wallpaperUpload$.pipe(
      catchError((err) => {
        if (!err) {
          return EMPTY;
        };

        this.apiService.handleError(err, true);

        return throwError(err);
      })
    );
  }


  deleteWallpaper(wallpaper): Observable<Object> {
    if (this.envService.ownerType === OwnerTypesEnum.Personal) {
      return this.apiService.deletePersonalWallpaper(wallpaper.wallpaper);
    } else {
      return this.apiService.deleteBusinessWallpaper(this.envService.businessUuid, encodeURI(wallpaper.wallpaper));
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }
}
