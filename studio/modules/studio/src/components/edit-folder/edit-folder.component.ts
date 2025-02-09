import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { AppThemeEnum } from '@pe/common';
import { OverlayHeaderConfig, PeOverlayWidgetService, PE_OVERLAY_CONFIG, PE_OVERLAY_DATA } from '@pe/overlay-widget';
@Component({
  selector: 'pe-edit-folder',
  templateUrl: './edit-folder.component.html',
  styles: [],
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
  ) {
    config.doneBtnCallback = this.saveData;
    this.theme = appData.theme;
    this.businessId = appData.businessId;
    if (appData.item) {
      this.image = appData.item.image;
      this.title = appData.item.name;
    }

  }

  onUpdatePicture(image): void {
    this.image = image.image;
  }

  saveData = () => {
    this.config.onSaveSubject$.next({
      method: this.appData.method,
      itemType: 'folder',
      item: this.appData.item,
      parentNode: this.appData.parentNode,

      fields: {
        icon: this.image,
        name: this.title,
        albumId: this.appData?.item?.id
      }
    });
    this.overlay.close();
  }

}
