import { Component } from '@angular/core';
import { Select } from '@ngxs/store';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Observable } from 'rxjs';

import {
  PebActionsService,
  PebClipboardActionHandler,
  PebCumulativeStyleActionHandler,
  PebDeleteActionHandler,
  PebDropFileActionHandler,
  PebElementsActionHandler,
  PebIndexActionHandler,
  PebInsertActionHandler,
  PebMoveActionHandler,
  PebPageActionHandler,
  PebPublishingActionHandler,
  PebRenderActionHandler,
  PebResizeActionHandler,
  PebShapesActionHandler,
  PebThemeActionHandler,
  PebUndoActionHandler,
} from '@pe/builder/action-handlers';
import { PebPreviewRendererService } from '@pe/builder/preview-renderer';
import { PebSidebarsState, PebSidebarsStateModel } from '@pe/builder/state';
import { BusinessInterface } from '@pe/business';
import { PeOverlayWidgetService } from '@pe/overlay-widget';
import { BusinessState } from '@pe/user';


@Component({
  selector: 'pe-builder-app',
  templateUrl: './app.component.html',
  styleUrls: ['../../../builder/styles/src/lib/styles/_sidebars.scss', './app.component.scss'],
  providers: [
    PebActionsService,
    PebClipboardActionHandler,
    PebCumulativeStyleActionHandler,
    PebDeleteActionHandler,
    PebDropFileActionHandler,
    PebElementsActionHandler,
    PebIndexActionHandler,
    PebInsertActionHandler,
    PebMoveActionHandler,
    PebPageActionHandler,
    PebPreviewRendererService,
    PebPublishingActionHandler,
    PebRenderActionHandler,
    PebResizeActionHandler,
    PebShapesActionHandler,
    PebThemeActionHandler,
    PebUndoActionHandler,
    PeOverlayWidgetService,
  ],
})
export class PeBuilderAppComponent {
  @Select(PebSidebarsState.sidebars) sidebars$!: Observable<PebSidebarsStateModel>;
  @SelectSnapshot(BusinessState.businessData) businessData!: BusinessInterface;

  constructor(
    private actionsService: PebActionsService,
    private clipboardActionHandler: PebClipboardActionHandler,
    private clipboardHandler: PebClipboardActionHandler,
    private cumulativeStyleActionHandler: PebCumulativeStyleActionHandler,
    private deleteActionHandler: PebDeleteActionHandler,
    private dropFileActionHandler: PebDropFileActionHandler,
    private elementsActionHandler: PebElementsActionHandler,
    private insertActionHandler: PebInsertActionHandler,
    private moveActionHandler: PebMoveActionHandler,
    private pageActionHandler: PebPageActionHandler,
    private publishingActionHandler: PebPublishingActionHandler,
    private renderActionHandler: PebRenderActionHandler,
    private resizeActionHandler: PebResizeActionHandler,
    private shapesActionHandler: PebShapesActionHandler,
    private themeActionHandler: PebThemeActionHandler,
    private undoActionHandler: PebUndoActionHandler,
    private zIndexActionHandler: PebIndexActionHandler,
  ) { }
}
