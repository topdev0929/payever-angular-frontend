import { ChangeDetectionStrategy, Component } from '@angular/core';

import { PebSideBarService } from '@pe/builder/services';
import { PeDestroyService } from '@pe/common';
import { TranslateService } from '@pe/i18n-core';

import { PebInteractionsFormEditComponent } from './interactions-form-edit.component';
import { PebInteractionsFormService } from './interactions-form.service';
import { ListItemModel } from './model';


@Component({
  selector: 'peb-interactions-form-list',
  templateUrl: './interactions-form-list.component.html',
  styleUrls: [
    '../../../../styles/src/lib/styles/_sidebars.scss',
    './interactions-form-list.component.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PebInteractionsFormListComponent {
  interactions$ = this.interactionsFormService.interactions$;

  constructor(
    private readonly interactionsFormService: PebInteractionsFormService,
    private readonly sideBarService: PebSideBarService,
    private readonly translationService: TranslateService,
  ) {
  }

  addTrigger() {
    this.interactionsFormService.addNewInteraction();
    this.openSidebar();
  }

  editTrigger(item: ListItemModel) {
    this.interactionsFormService.setEditingInteraction(item.key, item.interaction);
    this.openSidebar();
  }

  removeTrigger(model: ListItemModel) {
    this.interactionsFormService.removeInteraction(model.key);
  }

  openSidebar() {
    const backTitle = this.translationService.translate('builder-app.forms.animation.title');
    const title = this.translationService.translate('builder-app.forms.animation.trigger');

    this.sideBarService.openDetail(PebInteractionsFormEditComponent, { backTitle, title });
  }
}
