import { Injectable } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable, Subject, combineLatest } from 'rxjs';
import { map, take, takeUntil, tap, withLatestFrom } from 'rxjs/operators';

import { PeAuthService } from '@pe/auth';
import {
  PebDefaultScreens,
  PebElementType,
  PebLanguage,
  PebScreen,
  PebScreenEnum,
  PebShape,
  PebShapeAlbum,
  pebGenerateId,
} from '@pe/builder/core';
import { calculatePebSizeToPixel, elementModels, toElementsDTO } from '@pe/builder/editor-utils';
import { isPlainObject } from '@pe/builder/render-utils';
import { PebRendererService } from '@pe/builder/renderer';
import {
  PebCreateShapeAlbumAction,
  PebDeleteShapeAction,
  PebDeleteShapeAlbumAction,
  PebEditorState,
  PebInsertAction,
  PebOptionsState,
  PebShapesState,
  PebUpdateShapeAlbumAction,
} from '@pe/builder/state';
import { PeDestroyService, PeGridItemType } from '@pe/common';
import { PeGridItem } from '@pe/grid';
import { FolderItem } from '@pe/shared/folders';

import { PebCreateShapeService } from './create-shape/create-shape.service';
import { DefaultFolderIds } from './create-shape/enums';
import { DEFAULT_CONTEXT_MENU_ITEMS } from './shapes.interface';


export const clonePlainObject = (obj: any) => {
  if (isPlainObject(obj)) {
    let cloned = { ...obj };
    Object.entries(cloned).forEach(([key, value]) => {
      if (isPlainObject(value)) {
        cloned[key] = clonePlainObject(value);
      }
    });

    return cloned;
  }

  return obj;
};


@Injectable({ providedIn: 'any' })
export class PebShapesService {
  @Select(PebOptionsState.screen) screen$!: Observable<PebScreen>;
  @Select(PebShapesState.shapes) shapes$!: Observable<PebShape[]>;
  @Select(PebShapesState.albums) albums$!: Observable<PebShapeAlbum[]>;
  @Select(PebEditorState.screens) screens$!: Observable<PebScreen[]>;
  @Select(PebOptionsState.language) language$!: Observable<PebLanguage>;

  readonly folders$: Observable<FolderItem[]> = this.albums$.pipe(
    map((albums) => {
      const recursive = (album) => {
        const isHideMenu = !this.authService.isAdmin() && album.basic;

        return {
          _id: album.id,
          name: album.name,
          isHideMenu: isHideMenu,
          isProtected: isHideMenu,
          menuItems: DEFAULT_CONTEXT_MENU_ITEMS,
          parentFolderId: album.parent,
          children: albums.filter(e => e.parent === album.id).map(e => recursive(e)),
        };
      };

      const virtualAlbum = {
        image: 'assets/icons/folder.svg',
        isHideMenu: true,
        isProtected: true,
      };

      return [
        { ...virtualAlbum, position: 1, _id: DefaultFolderIds.Basic, name: 'Basic Shapes' },
        { ...virtualAlbum, position: 2, _id: DefaultFolderIds.Library, name: 'Marketplace' },
        ...albums.filter(a => !a.parent).map(album => recursive(album))];
    }),
  );

  readonly albumId$ = new Subject<string[]>();

  readonly total$ = this.shapes$.pipe(
    map(data => data.length),
  );

  readonly items$ = combineLatest(this.shapes$, this.albumId$.pipe()).pipe(
    map(([shapes, albumIds]) => {
      if (!albumIds || albumIds.includes(DefaultFolderIds.Root)) {
        return shapes.filter(shape => shape.album !== DefaultFolderIds.Library);
      }

      return albumIds.includes(DefaultFolderIds.Basic)
        ? shapes.filter(shape => shape.basic && shape.album !== DefaultFolderIds.Library)
        : shapes.filter(shape => albumIds.includes(shape.album));
    }),
    map((items) => {
      return items.map(item => ({ ...item, dto: toElementsDTO(item.elements), defs: item.elements }));
    }),
  );

  private readonly insert$ = new Subject<string>();

  dispatch$ = this.insert$.pipe(
    withLatestFrom(this.items$),
    tap(([id, items]) => {
      const shape = items.find(shape => shape.id === id);
      this.store.dispatch(new PebInsertAction(shape.elements, { selectInserted: true, sync: true }));
    }),
  );

  readonly gridItems$ = this.items$.pipe(
    withLatestFrom(this.screens$, this.language$),
    map(([items, breakpoints, language]) => items.map((item) => {
      return {
        ...item,
        dto: elementModels([...item.dto.values()], breakpoints[0], language, breakpoints).elements,
      };
    })),
    withLatestFrom(this.screens$),
    map(([items, screens]) => items.filter(item => item.dto.length > 0).map((item) => {
      return this.generateGridItemLayout(item, screens[0]);
    })),
  );

  constructor(
    private readonly rendererService: PebRendererService,
    private readonly store: Store,
    private readonly createShape: PebCreateShapeService,
    private readonly authService: PeAuthService,
    private readonly destroy$: PeDestroyService,
  ) {
    this.dispatch$.pipe(
      takeUntil(this.destroy$),
    ).subscribe();
  }

  generateGridItemLayout(item: any, screen: PebScreen){
    const defaultScreen = PebDefaultScreens[PebScreenEnum.Desktop];
    const root = item.dto.find(e => e.parent === undefined);
    const { dimension } = root.styles;
    const screenWidth = root.screen.width || defaultScreen.width;
    const screenHeight = root.maxY || screenWidth;

    const [positionLeft] = root.styles.position?.left?.value === 0 ? [0]
    : calculatePebSizeToPixel([root.styles.position.left], screenWidth);
    const [positionRight] = root.styles.position?.right?.value === 0 ? [0]
    : calculatePebSizeToPixel([root.styles.position.right], screenWidth);
    const translateX = positionRight - positionLeft;

    const isVertical = dimension.height?.value > dimension.width?.value;

    const elements = item.dto.map((elm) => {
      return this.rendererService.renderElement({ ...elm, screen: defaultScreen });
    });

    const gridItem = toGridItem({ ...item, elements });

    const max = 125;
    const maxScale = 1;

    const [width] = root.type !== PebElementType.Section && ['%', 'auto'].includes(dimension.width.unit)
    ? [screenWidth]
    : calculatePebSizeToPixel([root.type === PebElementType.Section ? screen.width : dimension.width], max);
    
    const [height] =
    root.type !== PebElementType.Section && ['%', 'auto'].includes(dimension.height.unit)
    ? [screenHeight]
    : calculatePebSizeToPixel([dimension.height], max);

    gridItem.data.width = width;
    gridItem.data.height = height;
    gridItem.data.translateX = translateX / 2;

    gridItem.data.scale = Math.min(max / (isVertical ? height : width), maxScale);

    return gridItem as PeGridItem;
  }

  loadAlbum(id: string[]): void {
    this.albumId$.next(id);
  }

  insertByShapeId(id: string) {
    this.insert$.next(id);
  }

  deleteAlbum(album: FolderItem) {
    this.store.dispatch(new PebDeleteShapeAlbumAction(album._id));

    this.shapes$.pipe(
      map(shapes => shapes.filter(shape => shape.album === album._id)),
      tap(shapes => shapes.forEach(shape => this.deleteShape(shape.id))),
      take(1),
    ).subscribe();
  }

  updateAlbum(album: FolderItem) {
    const shapeAlbum = this.getShapeAlbum(album);
    this.store.dispatch(new PebUpdateShapeAlbumAction(shapeAlbum));
  }

  createAlbum(album: FolderItem) {
    const shapeAlbum = this.getShapeAlbum(album);
    this.store.dispatch(new PebCreateShapeAlbumAction(shapeAlbum));
  }

  private getShapeAlbum(album: FolderItem): PebShapeAlbum {
    return {
      basic: album.data?.basic,
      id: album._id,
      name: album.name,
      parent: album.parentFolderId,
    };
  }

  updateShape(gridItem) {
    const shape: PebShape = {
      elements: gridItem.data.defs,
      id: gridItem.data.id,
      title: gridItem.data.title,
      album: gridItem.data.album,
      basic: gridItem.data.basic,
    };
    this.createShape.openEditDialog(shape);
  }

  deleteShape(id: string) {
    this.store.dispatch(new PebDeleteShapeAction(id));
  }

  createMasterPage(params: { themeId: string, action: any }, id = pebGenerateId()): void {
    // PebWebsocketEventType.CreateMasterPage
  }

  addAction(params: { action: any, themeId: string }): void {
    // PebWebsocketEventType.AddAction
  }

  deleteAction(params: { actionId: string, themeId: string }): void {
    // PebWebsocketEventType.DeleteAction
  }
}

export const toGridItem = (shape: any): PeGridItem => {
  return {
    id: shape.id,
    title: shape.title,
    basic: true,
    action: {
      label: 'Add',
      more: !shape.basic,
    },
    columns: [
      {
        name: 'name',
        value: 'name',
      },
      {
        name: 'action',
        value: 'action',
      },
    ],
    image: null,
    type: PeGridItemType.Item,
    data: {
      ...shape,
      scale: 1,
      elements: shape.elements,
    },
  };
};
