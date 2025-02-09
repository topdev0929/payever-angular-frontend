import { HttpEvent } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BlobCreateResponse, MediaContainerType, MediaService } from '@pe/media';
import { BehaviorSubject, Observable, of, zip } from 'rxjs';
import { takeUntil } from 'rxjs/internal/operators';
import { share, switchMap } from 'rxjs/operators';
import { OwnerTypesEnum } from '../misc/enum';
import { WallpaperGridItemInterface } from '../misc/interfaces';
import { AbstractService, ApiService, BusinessEnvService, WallpaperDataInterface } from './index';

@Injectable()
export class PebWallpapersService extends AbstractService {

  private readonly wallpapersItems$ = new BehaviorSubject<WallpaperGridItemInterface[]>([]);
  mediaContainerType = MediaContainerType.Wallpapers;

  constructor(
    private apiService: ApiService,
    private envService: BusinessEnvService,
    private mediaService: MediaService,
  ) {
    super();
  }

  get businessId() {
    return this.envService.businessUuid;
  }

  getWallpaperGridItemObservable$(): Observable<WallpaperGridItemInterface[]> {
    return this.wallpapersItems$.asObservable().pipe(share());
  }

  loadAllWallpapers(page, limit) {
    return this.apiService.getAllWallpapers(page, limit);
  }
  loadWallpapersTree() {
    return this.apiService.getWallpaperTree();
  }

  loadWallpaperByCode(code, page, limit) {
    return this.apiService.getWallpapersByCode(code, page, limit);
  }

  searchWallpaper(searchItems, navId, page, limit) {
    return this.apiService.searchWallpaper(searchItems, page, limit, navId);
  }

  loadWallpapers(page, limit) {
    return this.apiService.getAllWallpapers(page, limit)
      .pipe(
        takeUntil(this.ngUnsubscribe),
        switchMap(galleryWallpapers => {
          return zip(of(galleryWallpapers),
            this.envService.ownerType === OwnerTypesEnum.Personal
              ? this.apiService.getMyPersonalWallpapers()
              : this.apiService.getMyBusinessWallpapers(this.envService.businessUuid),
          );
        }),
      );
  }

  setWallpaper(wallpaper) {
    if (this.envService.ownerType === OwnerTypesEnum.Personal) {
      return this.apiService.setPersonalWallpaper(wallpaper);
    } else {
      return this.apiService.setBusinessWallpaper(this.businessId , wallpaper);
    }
  }

  public postImageBlob = (file: File): Observable<HttpEvent<BlobCreateResponse>> => {
    if (this.envService.ownerType === OwnerTypesEnum.Business) {
      return this.mediaService.createBlobByBusiness(this.envService.businessUuid, this.mediaContainerType, file);
    } else if (this.envService.ownerType === OwnerTypesEnum.Personal) {
      return this.mediaService.createBlobByUser(this.envService.userUuid, this.mediaContainerType, file);
    }
  }

  onWallpaperUploaded(wallpaper: string, theme: string): WallpaperDataInterface {
    const data: WallpaperDataInterface = { wallpaper, theme };
    if (this.envService.ownerType === OwnerTypesEnum.Business) {
      this.apiService.addBusinessWallpaper(this.envService.businessUuid, data).subscribe({
        error: err => {
          this.apiService.handleError(err, true);
        },
      });
    } else if (this.envService.ownerType === OwnerTypesEnum.Personal) {
      this.apiService.addPersonalWallpaper(data).subscribe({
        error: err => {
          this.apiService.handleError(err, true);
        },
      });
    }

    return data;
  }

  deleteWallpaper(wallpaper) {
    if (this.envService.ownerType === OwnerTypesEnum.Personal) {
      return this.apiService.deletePersonalWallpaper(wallpaper.wallpaper).subscribe();
    } else {
      return this.apiService.deleteBusinessWallpaper(this.envService.businessUuid, wallpaper.wallpaper).subscribe();
    }
  }
}
