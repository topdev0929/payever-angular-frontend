import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { share } from 'rxjs/operators';

// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { PebEditorApi } from '@pe/builder/api';
import { MessageBus } from '@pe/common';
import { ConfirmScreenService, Headings } from '@pe/confirmation-screen';
import { PeGridItem, PeGridItemType, PeGridView } from '@pe/grid';
import { TranslateService } from '@pe/i18n-core';
import { FolderItem } from '@pe/shared/folders';

import { PeThemeTypesEnum } from '../enums';

@Injectable({ providedIn: 'any' })
export class PeThemesGridService {
  public readonly confirmation$ = this.messageBus.listen<boolean>('confirm').pipe(share());
  public lastGridView: PeGridView;
  public selectedFolder: FolderItem;

  constructor(
    private confirmScreenService: ConfirmScreenService,
    private messageBus: MessageBus,
    private pebEditorApi: PebEditorApi,
    private translateService: TranslateService,
  ) { }


  public backdropClick = () => {
  };

  public openConfirmDialog(headings: Headings): void {
    this.confirmScreenService.show(headings, false);
  }

  public openPage(pageId: string, themeId: string) {
    return this.pebEditorApi.getPage(themeId, pageId);
  }

  public themesToGridItemMapper(themes: any[]): PeGridItem[] {
    const isMobile = window.innerWidth <= 720;

    return themes.map((theme) => {
      const isActive = theme.isActive;
      const isInstalled = theme.type !== PeThemeTypesEnum.Template;
      let condition: string;
      if (isActive) {
        condition = 'builder-themes.messages.active';
      } else if (isInstalled) {
        condition = 'builder-themes.messages.installed';
      } else {
        condition = 'builder-themes.messages.not_installed';
      }
      return {
        action: {
          label: isInstalled
            ? 'builder-themes.actions.open'
            : 'builder-themes.actions.install',
          more: isInstalled,
          disabled: isMobile,
        },
        badge: {
          backgroundColor: null,
          color: null,
          label: condition,
        },
        columns: [
          {
            name: 'name',
            value: theme.name,
          },
          {
            name: 'condition',
            value: this.translateService.translate(condition),
          },
          {
            name: 'preview',
            value: 'preview',
          },
          {
            name: 'action',
            value: 'action',
          },
        ],
        data: {
          isActive: isActive,
          isInstalled: isInstalled,
        },
        id: theme?.applicationScopeElasticId ?? theme._id,
        image: theme.picture ?? 'assets/icons/folder-grid.png',
        isDraggable: theme.type !== PeThemeTypesEnum.Template,
        itemLoader$: new BehaviorSubject<boolean>(false),
        serviceEntityId: theme.serviceEntityId ?? theme._id,
        title: theme.name,
        type: PeGridItemType.Item,
      };
    });
  }
}
