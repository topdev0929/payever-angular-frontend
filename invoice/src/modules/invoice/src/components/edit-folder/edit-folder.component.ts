import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';

import { AppThemeEnum } from '@pe/common';
import { OverlayHeaderConfig, PeOverlayWidgetService, PE_OVERLAY_CONFIG, PE_OVERLAY_DATA } from '@pe/overlay-widget';
import { ThemesApi } from '@pe/themes';


@Component({
  selector: 'pe-edit-folder',
  templateUrl: './edit-folder.component.html',
  styleUrls: ['./edit-folder.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditFolderComponent {
  theme: AppThemeEnum;
  businessId: string;
  title: string;
  image: string;

  constructor(
    @Inject(PE_OVERLAY_DATA) private appData: any,
    @Inject(PE_OVERLAY_CONFIG) public config: OverlayHeaderConfig,
    private overlay: PeOverlayWidgetService,
    private themesApi: ThemesApi,
  ) {
    config.doneBtnCallback = this.saveData;
    this.theme = appData.theme;

    if (appData.item && appData.type === 'edit') {
      this.title = appData.item.name || appData.item.title;
      this.image = appData.item.image;
    }

  }

  onUpdatePicture(image) {
    this.image = image.image;
  }

  saveData = () => {
    if (this.appData.type === 'edit') {
      this.themesApi.updateThemeAlbum(this.appData.item.id, { name: this.title, icon: this.image })
        .subscribe((data) => {
          this.config.onSaveSubject$.next({ updatedItem: data, appData: this.appData });
          this.overlay.close();

        });
    } else {
      const payload: any = { name: this.title, icon: this.image };
      if (this.appData.item) {
        payload.parent = this.appData.item.id;
      }
      this.themesApi.createThemeAlbum(payload).subscribe((data) => {
        this.config.onSaveSubject$.next({ updatedItem: data, appData: this.appData });
        this.overlay.close();
      });
    }
  }
}
