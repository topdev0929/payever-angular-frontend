import { EventEmitter, Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslateService } from '@pe/i18n-core';
import { MediaContainerType, MediaUrlPipe } from '@pe/media';
import { WallpaperDataInterface } from './api.service';

@Injectable()
export class WallpaperGridItemConverterService {
  refreshData$ = new EventEmitter();
  mediaContainerType = MediaContainerType.Wallpapers;
  industryTranslationKey: string = 'assets.industry.';
  constructor(
    private mediaUrlPipe: MediaUrlPipe,
    private translateService: TranslateService,
    private sanitizer: DomSanitizer,
  ) { }

  getDataGridItems(wallpapers: WallpaperDataInterface[], activeWallpaper): any[] {
    return wallpapers.map((wallpaper) => {
      if (wallpaper.industry && !wallpaper.industry.includes(this.industryTranslationKey)) {
        wallpaper.industry = this.translateService.translate(`${this.industryTranslationKey + wallpaper.industry}`);
      }

      return {
        id: wallpaper,
        image: this.mediaUrlPipe.transform(wallpaper.wallpaper, this.mediaContainerType),
        title: wallpaper.name,
        description: wallpaper.industry,
        labels:  this.isWallpaperSet(wallpaper, activeWallpaper) ? ['SET'] : [],
        customFields: [
          {
            content: wallpaper.industry,
          },
          {
            content: this.sanitizer.bypassSecurityTrustHtml(!this.isWallpaperSet(wallpaper, activeWallpaper) ? `
                  <div style="
                    width: 100%;
                    height: 100%;
                    display: flex;
                    justify-content: flex-end;
                    align-items: center;
                  ">
                    <button style="
                      border-radius: 6px;
                      background-color: rgba(255, 255, 255, 0.3);
                      border: 0;
                      outline: 0;
                      color: #ffffff;
                      width: 51px;
                      height: 24px;
                      font-family: 'Roboto', sans-serif;
                      font-size: 12px;
                      font-weight: normal;
                      font-stretch: normal;
                      font-style: normal;
                      line-height: 1.33;
                      letter-spacing: normal;
                      text-align: center;">
                      ${this.translateService.translate('info_boxes.panels.wallpaper.single_selected_action.set')}
                    </button>
                  </div>
                ` : ``),
            callback: () => {
              this.refreshData$.next({wallpaper});
            },
          },
        ],
      };
    });
  }

  getFilteredWallpapers(galleryWallpapers: WallpaperDataInterface[], activeWallpaper) {
    return this.getDataGridItems(galleryWallpapers, activeWallpaper);
  }

  isWallpaperSet(wallpaper, activeWallpaper): boolean {
    return wallpaper.wallpaper === activeWallpaper?.wallpaper && wallpaper.name === activeWallpaper?.name;
  }

  filterDataGrid(searchItems, items) {
    let filterItems = items;

    searchItems.forEach((searchItem) => {
      const { filter, contains, searchText } = searchItem;
      let filtered = [];
      if (filter.toLowerCase() === 'price') {
        filtered = filterItems.filter((item) => {
          return item.data.rates.find(rate => contains === 0
            ? rate.price.toString().includes(searchText)
            : !rate.price.toString().includes(searchText));
        });
      } else {
        filtered = filterItems.filter((item) => {
          if (contains === 0) {
            return String(item.id[filter.toLowerCase()]).toLowerCase().includes(searchText.toLowerCase());
          }

          return !String(item.id[filter.toLowerCase()]).toLowerCase().includes(searchText.toLowerCase());
        });
      }

      filterItems = filtered;
    });

    return filterItems;
  }
}
