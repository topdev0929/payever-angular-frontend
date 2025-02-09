import { Component } from '@angular/core';

import { SkinInterface, SkinEventInterface, SkinWidgetConfigInterface } from '../../../../kit/skin-widget';

@Component({
  selector: 'doc-skin-widget',
  templateUrl: 'skin-widget-doc.component.html'
})
export class SkinWidgetDocComponent {

  jsEx1: string = `
<pe-skin-widget [customSkinsItems]="customItems"
                [presetSkinsItems]="presetItems"
                [isPresetRemoveEnabled]="false"
                [config]="config"
                (skinItemClicked)="onSkinItemClicked($event)"
                (deleteSkinItemClicked)="onDeleteSkinItemClicked($event)"
                (uploadSkinItemClicked)="onUploadSkinItemClicked($event)"
                (closed)="onClose()"
></pe-skin-widget>
  `;

  jsEx2: string = `
import { SkinInterface, SkinEventInterface, SkinWidgetConfigInterface } from '../../../../kit/skin-widget';

export class YourComponent {

  config: SkinWidgetConfigInterface = {
    close: 'Close',
    addImage: 'Add image',
    uploadBtn: {
      uploading: 'Uploading...',
      fail: 'Uploading failed',
      retry: 'Please retry'
    }
  };

  presetItems: SkinInterface[] = [
    // your preset items
  ];

  customItems: SkinInterface[] = [
    // your custom items
  ];

  onSkinItemClicked(item: SkinEventInterface): void {
    // your code
  }

  onDeleteSkinItemClicked(item: SkinEventInterface): void {
    // your code
  }

  onClose(): void {
    // your code
  }

  onUploadSkinItemClicked(isPreset: boolean): void {
    // your code
  }
}
  `;

  config: SkinWidgetConfigInterface = {
    close: 'Close',
    addImage: 'Add image',
    uploadBtn: {
      uploading: 'Uploading...',
      fail: 'Uploading failed',
      retry: 'Please retry'
    }
  };

  presetItems: SkinInterface[] = [
    {
      uuid: '1P',
      media: {
        sources: {
          thumb: {
            url: 'https://www.city.ac.uk/__data/assets/image/0008/342647/Cass-MBA-top-in-London-Financial-Times.jpg'
          }
        }
      }
    },
    {
      uuid: '2P',
      media: {
        sources: {
          thumb: {
            url: 'https://www.city.ac.uk/__data/assets/image/0008/342647/Cass-MBA-top-in-London-Financial-Times.jpg'
          }
        }
      }
    },
    {
      uuid: '3P',
      media: {
        sources: {
          thumb: {
            url: 'https://www.city.ac.uk/__data/assets/image/0008/342647/Cass-MBA-top-in-London-Financial-Times.jpg'
          }
        }
      }
    },
    {
      uuid: '4P',
      media: {
        sources: {
          thumb: {
            url: 'https://www.city.ac.uk/__data/assets/image/0008/342647/Cass-MBA-top-in-London-Financial-Times.jpg'
          }
        }
      }
    }
  ];

  customItems: SkinInterface[] = [
    {
      uuid: '1C',
      media: {
        sources: {
          thumb: {
            url: 'https://www.city.ac.uk/__data/assets/image/0008/342647/Cass-MBA-top-in-London-Financial-Times.jpg'
          }
        }
      }
    },
    {
      uuid: '2C',
      media: {
        sources: {
          thumb: {
            url: 'https://www.city.ac.uk/__data/assets/image/0008/342647/Cass-MBA-top-in-London-Financial-Times.jpg'
          }
        }
      }
    },
    {
      uuid: '3C',
      active: true,
      media: {
        sources: {
          thumb: {
            url: 'https://www.city.ac.uk/__data/assets/image/0008/342647/Cass-MBA-top-in-London-Financial-Times.jpg'
          }
        }
      }
    }
  ];

  onSkinItemClicked(item: SkinEventInterface): void {
    alert(`Clicked on ${ item.isPreset ? 'PRESET' : 'CUSTOM'} item with uuid: ${item.uuid}`);
  }

  onDeleteSkinItemClicked(item: SkinEventInterface): void {
    alert(`Deleted ${ item.isPreset ? 'PRESET' : 'CUSTOM'} item with uuid: ${item.uuid}`);
  }

  onClose(): void {
    alert('Close!');
  }

  onUploadSkinItemClicked(isPreset: boolean): void {
    alert(`${ isPreset ? 'PRESET' : 'CUSTOM'} item uploading started`);
  }

}
