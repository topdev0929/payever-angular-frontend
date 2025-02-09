import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, skip, takeUntil, tap } from 'rxjs/operators';

import {
  PebDefaultScreens,
  PebRenderContainer,
  PebScreenEnum,
  PebShape,
  PebShapeAlbum,
  SelectOption,
} from '@pe/builder/core';
import { elementModels, toElementsDTO } from '@pe/builder/editor-utils';
import { PebRendererService } from '@pe/builder/renderer';
import {
  PebCreateShapeAction,
  PebEditorState,
  PebInitShapesAction,
  PebOptionsState,
  PebShapesState,
  PebUpdateShapeAction,
} from '@pe/builder/state';
import { PeDestroyService } from '@pe/common';
import { PE_OVERLAY_DATA, PE_OVERLAY_SAVE } from '@pe/overlay-widget';

import { PebShapesService } from '../shapes.service';

import { DefaultFolderIds } from './enums';

@Component({
  selector: 'peb-create-shape-dialog',
  templateUrl: './create-shape.dialog.html',
  styleUrls: ['./create-shape.dialog.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PebCreateShapeDialog {
  @Select(PebShapesState.albums) albums$!: Observable<PebShapeAlbum[]>;

  albumOptions$ = this.albums$.pipe(
    map(items => [
      { name: 'All shapes', value: null },
      { value: DefaultFolderIds.Library, name: 'Marketplace' },
       ...items.map(item => ({ name: item.name, value: item.id })),
    ]),
  );

  selectedAlbum?: SelectOption;

  form = this.formBuilder.group({
    id: '',
    title: '',
    elements: [],
    basic: false,
    type: 'template',
    album: null,
  });

  scale = 1;
  translateX = 0;
  max = 250;
  height = 250;
  width = 250;

  viewElements: any[] = [];
  container: PebRenderContainer = {
    key: 'preview',
    renderScripts: false,
  };

  constructor(
    @Inject(PE_OVERLAY_SAVE) private overlaySaveSubject: BehaviorSubject<any>,
    @Inject(PE_OVERLAY_DATA) private overlayData: { shape: PebShape, isUpdate: boolean },
    private readonly formBuilder: FormBuilder,
    private readonly shapesService: PebShapesService,
    private readonly store: Store,
    private readonly rendererService: PebRendererService,
    private readonly destroy$: PeDestroyService,
  ) {

    this.prepareElementView();

    this.overlaySaveSubject.pipe(
      skip(1),
      tap(() => {
        const value = this.form.value;

        if (this.overlayData.isUpdate) {
          this.store.dispatch(new PebUpdateShapeAction(value));
        } else {
          this.store.dispatch(new PebCreateShapeAction(value));
        }
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  private setViewElements() {
    const breakpoints = this.store.selectSnapshot(PebEditorState.screens);
    const language = this.store.selectSnapshot(PebOptionsState.language);
    const elements = elementModels(
      toElementsDTO(this.overlayData.shape.elements),
      breakpoints[0],
      language,
      breakpoints
    ).elements;

    this.setScale();
    this.viewElements = elements.map(elm =>
      this.rendererService.renderElement({ ...elm, screen: PebDefaultScreens[PebScreenEnum.Desktop] })
    );
  }

  private setScale(): void {
    const maxScale = 1;
    const horizontal = this.width > this.height;
    const size = horizontal ? this.width : this.height;

    this.scale = Math.min(this.max / size, maxScale);
  }

  prepareElementView(): void{
    this.store.dispatch(new PebInitShapesAction());
    const screen = this.store.selectSnapshot(PebOptionsState.screen);
    const language = this.store.selectSnapshot(PebOptionsState.language);
    const shapeDto = { ...this.overlayData.shape, dto: toElementsDTO(this.overlayData.shape.elements) };
    const shape = { ...shapeDto, dto: elementModels([...shapeDto.dto.values()], screen, language, [screen]).elements };
    const shapePosition = this.shapesService.generateGridItemLayout(shape, screen);
    this.width = shapePosition.data.width;
    this.height = shapePosition.data.height;
    this.translateX = shapePosition.data.translateX;
    this.form.patchValue(this.overlayData.shape);
    this.setViewElements();
  }

  changeAlbum(album: SelectOption): void {
    this.form.patchValue({ album: album.value });
    this.selectedAlbum = album;
  }
}
