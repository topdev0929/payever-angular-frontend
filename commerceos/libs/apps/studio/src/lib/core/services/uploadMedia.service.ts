import { Inject, Injectable } from '@angular/core';

import { EnvironmentConfigInterface, EnvService, PE_ENV } from '@pe/common';

import { determineMediaType, generateEndpointUrl, generatePreviewUrl } from '../../utils/utils';
import { MediaType } from '../enums';
import { PeStudioMedia } from '../interfaces';

import { StudioApiService } from './studio-api.service';


@Injectable({ providedIn: 'root' })
export class UploadMediaService {
  type: MediaType;
  container: string;
  file: File;
  image: PeStudioMedia;
  uploadProgress: number;
  totalUploadProgress: number;
  baseApiUrl = `${this.env.backend.media}/api`;
  renderedPreview: string;

  constructor(
    private studioApiService: StudioApiService,
    private envService: EnvService,
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
  ) {}

  postMediaBlob(file: File) {
    const mediaType = determineMediaType(file);
    const endpoint = generateEndpointUrl(mediaType, this.baseApiUrl, this.envService.businessId);

    return this.studioApiService.sendMediaFile(file, endpoint);
  }

  createUserMedia(response: any, file: File) {
    const mediaType = determineMediaType(file);

    const mediaData: { mediaType: MediaType; name: string; url?: string } = {
      mediaType,
      name: file.name,
      url: generatePreviewUrl(mediaType, response, this.env.custom.storage),
    };

    return this.studioApiService.createUserMedia(mediaData);
  }

  addAlbumMedia(ids: string[], albumId: string) {
    return this.studioApiService.addMultipleMediaToAlbum(ids, albumId);
  }
}
