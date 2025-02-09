import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { switchMap, take, tap } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngxs/store';

import {
  AppThemeEnum,
  PeDataGridAdditionalFilter,
  PeDataGridFilter,
  PeDataGridItem,
} from '@pe/common';

import { StudioApiService } from './studio-api.service';
import { PeStudioMedia } from '../interfaces/studio-media.interface';
import {
  PeCreateAlbumBody,
  PeCreateUserMedia,
} from '../interfaces/media-details.model';
import { capitalizeFirstLetter, sortByField } from '../../utils/utils';
import { PeStudioAlbum } from '../interfaces/studio-album.interface';
import { PeStudioCategory } from '../interfaces/studio-category.interface';
import { StudioEnvService } from './studio-env.service';
import { PeMyMediaComponent } from '../../components/studio/my-media/pe-my-media.component';
import { InitLoadAlbums } from '../store/albums.actions';
import { SetCategories } from '../store/categories.actions';
import { DomSanitizer } from '@angular/platform-browser';



export const ALBUMS = 'albums';

export const DEFAULT = 'default';

@Injectable()
export class DataGridItemsService {

  get filters$(): Observable<any[]> {
    return this.filtersStream$.asObservable();
  }

  set filters(filters: any[]) {
    this.filtersStream$.next(filters);
  }
  set selectedIds(selectedIds: string[]) {
    this.selectedIdsStream$.next(selectedIds);
  }

  get dataGridItems$(): Observable<PeDataGridItem[]> {
    return this.dataGridItemsSubject$.asObservable();
  }

  get categories$(): Observable<PeStudioCategory[]> {
    return this.categoriesSubject$.asObservable();
  }
  categories: PeStudioCategory[] = [];
  constructor(
    private studioApiService: StudioApiService,
    private dialog: MatDialog,
    private envService: StudioEnvService,
    private store: Store,
    private sanitizer: DomSanitizer,
  ) { }
  public businessId: string;
  public userAlbums: PeStudioAlbum[];
  public ownUserMedia: PeStudioMedia[] = [];

  attributes: any[] = [];
  mediaFilter: PeDataGridAdditionalFilter;

  private selectedIdsStream$: BehaviorSubject<string[]> = new BehaviorSubject([]);

  selectedIds$: Observable<string[]> = this.selectedIdsStream$.asObservable();

  private filtersStream$: BehaviorSubject<PeDataGridFilter[]> = new BehaviorSubject([]);

  private dataGridItemsSubject$: BehaviorSubject<PeDataGridItem[]> = new BehaviorSubject([]);
  private categoriesSubject$: BehaviorSubject<PeStudioCategory[]> = new BehaviorSubject<PeStudioCategory[]>([]);

  addFilters(filters: any[]): void {
    this.filtersStream$.next(filters);
  }
  public addStudioMediaToList(studioMedia: PeStudioMedia): void {
    let studioMediaItems: PeDataGridItem[];
    const PeDataGridItems = this.dataGridItemsSubject$.getValue();

    studioMediaItems = [...[{
      id: studioMedia._id,
      title: studioMedia.name,
      image: studioMedia.url,
      customFields: [

      ]

    }], ...PeDataGridItems];
    this.dataGridItemsSubject$.next(studioMediaItems);
  }

  public addStudioMediaToAlbum(data: PeStudioMedia[]): void {
    let studioMediaItems: PeDataGridItem[] = [];
    const PeDataGridItems = this.dataGridItemsSubject$.getValue();

    data.forEach((studioMedia: PeStudioMedia) => {
      studioMediaItems.push({
        id: studioMedia._id,
        title: studioMedia.name,
        image: studioMedia.url,
      });
    });
    studioMediaItems = [...studioMediaItems, ...PeDataGridItems];
    this.dataGridItemsSubject$.next(studioMediaItems);
  }
  public setItems(dataGridItems: PeDataGridItem[]): void {
    this.dataGridItemsSubject$.next(dataGridItems);
  }

  public sortByGrid(sortParams): void {
    const PeDataGridItems = this.dataGridItemsSubject$.getValue();
    const resultDataGridItems = sortByField([...PeDataGridItems], { order: sortParams.order, param: sortParams.sortBy });
    const result = [...[], ...resultDataGridItems];
    this.dataGridItemsSubject$.next(result);
  }

  public removeFromAlbum(ids: string[]): Observable<PeDataGridItem[]> {
    const PeDataGridItems = this.dataGridItemsSubject$.getValue();
    const resultDataGridItems = PeDataGridItems.filter(mediaAlbum => !ids.includes(mediaAlbum.id));
    const result = [...[], ...resultDataGridItems];
    this.dataGridItemsSubject$.next(result);
    return this.dataGridItems$;
  }

  public refreshFilters(): void {
    this.filtersStream$.next(this.filtersStream$.getValue());
  }
  public setDataGridItems(studioMedia: PeStudioMedia[], mediaView: string, replace = true): void {
    const mediaItems = studioMedia.map(
      (media) => {

        return {
          id: media._id,
          title: media.name,
          image: media.url,
          name: media.name,
          type: media.mediaType,
          updatedAt: media.updatedAt,
          data: {
            attributes: media.attributes,
            userAttributes: media.userAttributes
          },
          customFields: [
            {content: media.mediaType},
            {
              content: this.sanitizer.bypassSecurityTrustHtml(`
              <button style="
                width: 51px;
                color:${this.envService.theme === AppThemeEnum.light ? 'black;' : 'white;'}
                height: 24px;
                border-radius: 6px;
                background-color: ${this.envService.theme === AppThemeEnum.light ? '#fafafa;' : 'rgba(255, 255, 255, 0.3);'}
                display:block;
                margin:auto;
                border:0;
                outline:0;
                float:right;
                cursor: pointer;
              ">Preview</button>
            `),
        callback: () => {
          this.openMediaPreview(media._id, mediaView);
        },
            }
          ]
        };
      });
    this.dataGridItemsSubject$.next(replace ? [...mediaItems] : [...mediaItems, ...this.dataGridItemsSubject$.value]);
  }


  openMediaPreview(id: string, mediaView: string): void {
    const medias = this.dataGridItemsSubject$.getValue();
    let singleMedia = medias.find(item => item.id === id) as any;
    const theme = (this.envService.theme) ? AppThemeEnum[this.envService.theme] : AppThemeEnum.default;
    singleMedia = { ...singleMedia, businessId: this.businessId, theme, mediaView };
    this.dialog.open(PeMyMediaComponent, {
      height: '100%',
      width: '100%',
      maxWidth: '100%',
      data: singleMedia,
      panelClass: [`preview-modal-overlay__${theme}`, 'studio-container'],
    });
  }

  addMediaToDownloaded(id: string): Observable<PeStudioAlbum> {
    const albumDownloaded: PeStudioAlbum = this.userAlbums.find((album: PeStudioAlbum) => album.name === 'Downloaded');
    if (!albumDownloaded) {
      const payload: PeCreateAlbumBody = {
        name: 'Downloaded',
        businessId: this.businessId,
        parent: null,
      };
      return this.studioApiService.createAlbum(this.businessId, payload).pipe(switchMap((album: PeStudioAlbum) => {
        this.store.dispatch(new InitLoadAlbums(this.businessId));
        this.refreshFilters();
        return this.addMultipleMediaToAlbum(id, album);
      }));
    }
    return this.addMultipleMediaToAlbum(id, albumDownloaded);
  }

  addMultipleMediaToAlbum(id: string, album: PeStudioAlbum): Observable<any> {
    this.dataGridItemsSubject$.next(this.dataGridItemsSubject$.getValue());
    return this.studioApiService.getSubscriptionMediaById(this.businessId, id).pipe(
      take(1),
      switchMap((data) => {
        const payload: PeCreateUserMedia = {
          businessId: this.businessId,
          mediaType: data.mediaType,
          url: data.url,
          name: data.name ? data.name : 'Sample title',
        };
        return this.studioApiService.createUserMedia(this.businessId, payload);
      }),
      switchMap((media: PeStudioMedia) => {
        this.ownUserMedia = [media, ...this.ownUserMedia];
        return this.studioApiService.addMultipleMediaToAlbum(
          this.businessId,
          [media._id],
          album._id,
        );
      }),
      tap(() => {
        this.dataGridItemsSubject$.next(this.dataGridItemsSubject$.getValue());
        this.store.dispatch(new SetCategories());

      }),
    );
  }
  addCategory(data: Partial<PeStudioCategory>): void {
    const categories = this.categoriesSubject$.getValue();
    const category = {} as PeStudioCategory;
    const result = [...categories, ...[{ ...category, data }]];
    this.categoriesSubject$.next(result);
  }

  setFilters(attributes): void {
    const attributeTypes = attributes.map((attribute) => capitalizeFirstLetter(attribute.type));
    const uniqueAttributes = Array.from(new Set(attributeTypes));

    const filters = uniqueAttributes.map((attribute) => {
      return {
        title: attribute,
        active: false,
        items: [],
      };
    });
    filters.forEach((category: any) => {
      attributes.forEach((attribute) => {
        if (capitalizeFirstLetter(attribute.type) === capitalizeFirstLetter(category.title)) {
          category.items.push({
            key: attribute._id,
            image: attribute.icon,
            title: capitalizeFirstLetter(attribute.name),
            selected: false,
            type: attribute.type === 'color' ? 'radio' : 'checkbox',
            category: 'default',
          });
        }
      });
    });
    this.filters = [
      this.mediaFilter,
      ...filters,
    ] as PeDataGridFilter[];
  }

  setUserAlbumsToCategories(albums: PeStudioAlbum[]): void {
    const categories = this.categoriesSubject$.getValue();
    const tempCategoriesArray: PeStudioCategory[] = albums.filter(album => album.userAttributes?.length === 0).map(
      (category: PeStudioAlbum) => {
      return {
        _id: category._id,
        id: category._id,
        key: category._id,
        name: category.name,
        parentId: category.parent,
        image: category.icon,
        children: albums.filter((child: PeStudioAlbum) => child.parent === category._id)
          .map(itemAlbum => (
            {
              id: itemAlbum._id,
              key: itemAlbum._id,
              name: itemAlbum.name,
              parentId: itemAlbum.parent,
              image: itemAlbum.icon,
              categoryId: category._id,
            })),
        subCategory: [],
        listItems: [],
        editing: false,
        business: this.businessId,
        active: false,
        iconUrl: category.icon,
        tree: [],
        category: ALBUMS,
      } as PeStudioCategory;
    });
    const result = [...categories, ...tempCategoriesArray];
    // TODO change to Redux Store
    this.categories = result;
    this.categoriesSubject$.next(result);
  }


}
