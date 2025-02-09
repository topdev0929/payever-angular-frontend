import { DialogConfigPresetName, DialogService } from '@pe/checkout/dialog';

import { DefaultDialogComponent } from '../components';

export interface LabelDialogSettingsInterface {
  attributeName?: string;
  attributeValue?: string;
  flowId: string;
  title: string;
  text: string;
}

export function openLabelModal(
  event: MouseEvent,
  dialogService: DialogService,
  dialogSettings: LabelDialogSettingsInterface,
): void {
  if (event?.composedPath) {
    const paths = event.composedPath() as HTMLElement[];
    const elem = paths.find(a => a.nodeName && a.nodeName.toLowerCase() === 'a') as HTMLAnchorElement;
    const { attributeName, attributeValue, flowId, title, text } = dialogSettings;

    if (attributeName && attributeValue) {
      const attr: string = elem ? elem.getAttribute(attributeName) : null;
      if (attr === attributeValue) {
        event.preventDefault();
        dialogService.open(DefaultDialogComponent, DialogConfigPresetName.Default, {
          flowId: flowId,
          title,
          text,
        });
      }
    } else if (elem) {
      event.preventDefault();
      dialogService.open(DefaultDialogComponent, DialogConfigPresetName.Default, {
        flowId: flowId,
        title,
        text,
      });
    }
  }
}
