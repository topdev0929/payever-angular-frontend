import { Injectable } from '@angular/core';
import { TranslateService } from '@pe/i18n';
import { MediaService } from '@pe/media';
import { WallpaperViewEnum } from '../misc/enum';

@Injectable()
export class PebWallpaperSidebarService {
  categoryTranslationKey: string = 'assets.product.';
  industryTranslationKey: string = 'assets.industry.';
  filename = 'folder.png';

  constructor(
    private translateService: TranslateService,
    private mediaService: MediaService,
    ) {
  }

  getTreeData(arr) {
    return {
      title: 'Industry',
      id: WallpaperViewEnum.gallery,
      tree: arr.map((category) => {
        return {
          category: category.code,
          name: this.translateService.translate(`${this.categoryTranslationKey + category.code}`),
          image: this.mediaService.getMediaUrl(this.filename, 'cdn/images'),
          id: category._id,
          children: category.industries.map((industry) => {
            return {
              isFolder: false,
              category: this.translateService.translate(`${this.industryTranslationKey + industry.code}`),
              folder: category.code,
              id: industry._id,
              name: this.translateService.translate(`${this.industryTranslationKey + industry.code}`),
              data: industry.wallpapers.map(wallpaper => {
                return {
                  isFolder: false,
                  category: wallpaper.name,
                };
              }),
            };
          }),
        };
      }),
      editMode: false,
    };
  }

  getMyWallpaperTree() {
    return {
      title: 'My wallpaper',
      id: WallpaperViewEnum.myWallpapers,
      tree: [],
    };
  }
}
