import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

import { PebMediaService, PebMediaSidebarCollectionFilters, PebMediaSidebarCollectionItem } from '@pe/builder-core';

import { mockMediaData, MockMediaDataInterface } from './media.constants';

@Injectable({ providedIn: 'root' })
export class MockMediaService extends PebMediaService {

  constructor(
    private http: HttpClient,
  ) {
    super();
  }

  getImageCollection(filters: PebMediaSidebarCollectionFilters): Observable<PebMediaSidebarCollectionItem[]> {
    return this.getMockData()
      .pipe(
        map(mock => mock.images),
        map((images: PebMediaSidebarCollectionItem[]) => this.filterCollection(filters, images))
      );
  }

  getVideoCollection(filters: PebMediaSidebarCollectionFilters): Observable<PebMediaSidebarCollectionItem[]> {
    return this.getMockData()
      .pipe(
        map(mock => mock.videos),
        map((videos: PebMediaSidebarCollectionItem[]) => this.filterCollection(filters, videos))
      );
  }

  getCategories() {
    return this.getMockData()
      .pipe(
        map(mock => mock.categories),
      );
  }

  getFormats() {
    return this.getMockData()
      .pipe(
        map(mock => mock.formats),
      );
  }

  getStyles() {
    return this.getMockData()
      .pipe(
        map(mock => mock.styles),
      );
  }


  getMockData(): Observable<MockMediaDataInterface> {
    return of(mockMediaData);
  }

  filterCollection(filters: PebMediaSidebarCollectionFilters, collection: PebMediaSidebarCollectionItem[]) {
    return collection.filter((item) => {
      if (!!filters.hasPeople === item.hasPeople) {
        const compareByCategory = filters.categories && filters.categories.length
          ? filters.categories.some(a => item.categories.includes(a))
          : true;

        const compareByStyle = filters.styles && filters.styles.length
          ? filters.styles.some(a => item.styles.includes(a))
          : true;

        const compareByFormat = filters.formats && filters.formats.length
          ? filters.formats.some(a => item.formats.includes(a))
          : true;

        return compareByCategory && compareByStyle && compareByFormat;
      }
      return false;
    });
  }

  uploadImage(blob: Blob): Observable<string> {
    return of(URL.createObjectURL(blob));
  }

  uploadVideo(videoBlob: Blob): Observable<string> {
    return of(URL.createObjectURL(videoBlob));
  }
}
