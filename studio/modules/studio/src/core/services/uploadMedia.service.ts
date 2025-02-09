import { Inject, Injectable } from '@angular/core';

import { StudioApiService } from './studio-api.service';
import { PeStudioMedia } from '../interfaces/studio-media.interface';
import { EnvironmentConfigInterface, PE_ENV } from '@pe/common';
import { Observable } from 'rxjs';

@Injectable({providedIn: 'root'})
export class UploadMediaService {
  type: 'image' | 'video';
  container: string;
  file: File;
  image: PeStudioMedia;
  uploadProgress: number;
  totalUploadProgress: number;

  constructor(
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
    private studioApiService: StudioApiService) {
  }

  postMediaBlob(file: File, businessId: string): any {
    const type = file && file.type.split('/')[0] === 'image' ? 'image' : 'video';
    this.container = type === 'image' ? 'builder' : 'builder-video';

    const uploadFile$ = this.studioApiService.sendMediaFile(
      file,
      businessId,
      type,
      this.container,
    );
    return uploadFile$;
  }
  createUserMedia(businessId: string, response: any, file): Observable<any> {
    const body = response.body;
    const type = file && file.type.split('/')[0] === 'image' ? 'image' : 'video';
    return this.studioApiService.createUserMedia(businessId, {
                  url: (type === 'video') ? `${this.env.custom.storage}/builder-video/${body.blobName}_preview` : `${this.env.custom.storage}/builder/${body.blobName}`,
                  mediaType: type,
                  businessId,
                  name: file.name,
                });
  }
  addAlbumMedia(businessId: string, ids: string[], albumId: string): Observable<any> {
    return this.studioApiService.addMultipleMediaToAlbum(businessId, ids, albumId );
  }
}
