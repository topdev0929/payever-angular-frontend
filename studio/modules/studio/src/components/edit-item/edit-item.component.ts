import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject } from '@angular/core';
import { AppThemeEnum } from '@pe/common';
import { OverlayHeaderConfig, PeOverlayWidgetService, PE_OVERLAY_CONFIG, PE_OVERLAY_DATA } from '@pe/overlay-widget';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { StudioAppState } from '../../core/store/studio.app.state';
import { StudioApiService } from '../../core';
import { Store } from '@ngxs/store';
import { EditGridItem } from '../../core/store/items.actions';

@Component({
  selector: 'pe-edit-item',
  templateUrl: './edit-item.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditItemComponent {
  @SelectSnapshot(StudioAppState.attributes) attributes: any[];
  theme: AppThemeEnum;
  usedAttributes = {
    tags: null,
    description: null
  };
  businessId: string;
  title: string;
  tags: string[] = [];
  description: string;
  image: string;
  mediaType: string;

  constructor(
    @Inject(PE_OVERLAY_DATA) private appData: any,
    @Inject(PE_OVERLAY_CONFIG) public config: OverlayHeaderConfig,
    private overlay: PeOverlayWidgetService,
    private studioApiService: StudioApiService,
    private cdr: ChangeDetectorRef,
    private store: Store
  ) {
    config.doneBtnCallback = this.saveData;
    this.theme = appData.theme;
    this.businessId = appData.businessId;
    this.findInAttributes();
    this.findInItemAttr();
    if (appData.item) {
      this.image = appData.item.image;
      this.mediaType = appData.item.type;
      this.title = appData.item.name;
    }

  }

  findInAttributes(): void {
    this.attributes.forEach(attr => {
      if (attr.name === 'Description') {
        this.usedAttributes.description = attr;
      }
      if (attr.name === 'Tags') {
        this.usedAttributes.tags = attr;
      }
    });
  }

  findInItemAttr(): void {
    this.appData.item.data.attributes.map((attr) => {
      if (attr.attribute._id === this.usedAttributes.description._id) {
        this.description = attr.value;
      }
      if (attr.attribute._id === this.usedAttributes.tags._id) {
        this.tags = attr.value;
      }

    });
  }

  onUpdatePicture(image): void {
    this.image = image.image;
    this.mediaType = image.mediaType;
  }

  saveData = () => {
    this.studioApiService.updateMedia(this.businessId, {
      url: this.image,
      mediaType: this.mediaType,
      businessId: this.businessId,
      attributes: [
        {
          attribute: this.usedAttributes.tags._id,
          value: ''
        },
        {
          attribute: this.usedAttributes.description._id,
          value: this.description
        }
      ],
      name: this.title,
    }, this.appData.item.id).subscribe(data => {
      this.store.dispatch(new EditGridItem(data));
      this.overlay.close();
    });
  }
}
