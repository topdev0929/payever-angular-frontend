import { WritableDraft } from 'immer/dist/internal';

import { PebElementDef } from '@pe/builder/core';


export function removeRedundantData(element: WritableDraft<PebElementDef>) {
  Object.keys(element.styles ?? {}).forEach((key) => {
    const styles = element.styles[key];
    const { textStyles, fill, dimension, position } = styles;

    element.styles[key] = { textStyles, fill, dimension, position } as any;
  });

  delete element.meta;
  delete element.figma;
  delete element.versionNumber;
  delete element.data?.version;
  delete element.data?.resizeSetting;
  delete element.data?.syncSizePosition;
  delete element.changeLog;
}