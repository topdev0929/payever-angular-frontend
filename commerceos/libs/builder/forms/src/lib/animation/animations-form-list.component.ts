import { ChangeDetectionStrategy, Component } from '@angular/core';

import { PebSideBarService } from '@pe/builder/services';
import { PeDestroyService } from '@pe/common';
import { TranslateService } from '@pe/i18n-core';

import { PebAnimationFormComponent } from './animation-form.component';
import { PebAnimationsFormService } from './animations-form.service';
import { ListItemModel } from './models';


@Component({
  selector: 'peb-animations-form-list',
  templateUrl: './animations-form-list.component.html',
  styleUrls: [
    '../../../../styles/src/lib/styles/_sidebars.scss',
    './animations-form-list.component.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PebAnimationsFormListComponent {
  animations$ = this.animationsFormService.animations$;

  constructor(
    private readonly animationsFormService: PebAnimationsFormService,
    private readonly sideBarService: PebSideBarService,
    private readonly translationService: TranslateService,
  ) {
  }

  addAnimation() {
    this.animationsFormService.addNewAnimation();
    this.openSidebar();
  }

  editAnimation(item: ListItemModel) {
    this.animationsFormService.setEditingAnimation(item.key, item.animation);
    this.openSidebar();
  }

  removeAnimation(model: ListItemModel) {
    this.animationsFormService.removeAnimation(model.key);
  }

  openSidebar() {
    const backTitle = this.translationService.translate('builder-app.forms.animation.title');
    const title = this.translationService.translate('builder-app.forms.animation.trigger');

    this.sideBarService.openDetail(PebAnimationFormComponent, { backTitle, title });
  }
}
