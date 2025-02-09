import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';

import { EditorSidebarTypes } from '@pe/builder/services';
import { PebSidebarsState, PebSetSidebarsAction, PebSidebarsStateModel, PebEditorState } from '@pe/builder/state';


export const OPTIONS = [
  {
    title: 'Navigator',
    disabled: false,
    active: false,
    image: '/assets/builder-app/icons/navigator.png',
    option: EditorSidebarTypes.Navigator,
  },
  {
    title: 'Inspector',
    disabled: false,
    active: false,
    image: '/assets/builder-app/icons/inspector.png',
    option: EditorSidebarTypes.Inspector,
  },
  {
    title: 'Master pages',
    disabled: false,
    active: false,
    image: '/assets/builder-app/icons/master-pages.png',
    option: EditorSidebarTypes.MasterPages,
  },
  {
    title: 'Layer List',
    disabled: false,
    active: false,
    image: '/assets/builder-app/icons/layer-list.png',
    option: EditorSidebarTypes.Layers,
  },
  // {
  //   title: 'Language',
  //   disabled: false,
  //   active: false,
  //   image: '/assets/icons/language.png',
  //   option: 'language',
  //   options: [
  //     ...Object.values(PebLanguage).map(lang => ({
  //       title: toTitleCase(lang),
  //       disabled: false,
  //       active: false,
  //       image: `/assets/builder-app/icons/language-${lang}.png`,
  //       option: `language.${lang}`,
  //     })),
  //     {
  //       title: 'Manage languages',
  //       disabled: false,
  //       active: false,
  //       image: '/assets/builder-app/icons/manage-languages.png',
  //       option: 'toggleLanguagesSidebar',
  //     },
  //   ],
  // },
  // {
  //   title: 'History',
  //   disabled: false,
  //   active: false,
  //   image:'/assets/builder-app/icons/history.png',
  //   option: EditorSidebarTypes.History,
  // },
  // {
  //   title: 'Preview',
  //   disabled: false,
  //   active: false,
  //   image:'/assets/builder-app/icons/preview.png',
  //   option: 'preview',
  // },
];


@Component({
  selector: 'pe-builder-view',
  templateUrl: './builder-view.component.html',
  styleUrls: ['./builder-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebShopBuilderViewComponent {
  options = OPTIONS;

  constructor(
    public dialogRef: MatDialogRef<PebShopBuilderViewComponent>,
    private readonly store: Store,
    private router: Router,
  ) {
    const state = this.store.selectSnapshot<PebSidebarsStateModel>(PebSidebarsState);
    this.options.forEach((item) => {
      item.active = state[item.option] ?? item.active;
    });
  }

  onCloseClick() {
    this.dialogRef.close();
  }

  setValue(key: string) {
    const value = this.store.selectSnapshot<PebSidebarsStateModel>(PebSidebarsState)[key];
    const option = this.options.find(item => item.option === key);

    option.active = !value;

    this.store.dispatch(new PebSetSidebarsAction({ [key]: !value }));
    this.dialogRef.close();

    if (key === 'masterPages' && option.active) {
      const masterPageId = this.store.selectSnapshot(PebEditorState.activePage)?.master?.page;
      masterPageId && this.router.navigate([], { queryParams: { pageId: masterPageId } });
    }
  }
}
