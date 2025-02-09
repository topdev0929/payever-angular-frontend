import {
  PEB_ROOT_SCREEN_KEY,
  PebDroppedFileEnum,
  PebElementDef,
  PebElementType,
  PebFill,
  PebFillMode,
  PebFillType,
  PebImageFill,
  PebPositionType,
  PebUnit,
  PebUploadedFile,
  PebVideoFill,
} from '@pe/builder/core';
import { lastMigrationVersion } from '@pe/builder/migrations';
import { getPebSize } from '@pe/builder/render-utils';

const fillResolvers = {
  [PebDroppedFileEnum.Image]: (PebUploadedFile: PebUploadedFile) => getImageFill(PebUploadedFile),
  [PebDroppedFileEnum.Video]: (PebUploadedFile: PebUploadedFile) => getVideoFill(PebUploadedFile),
};

export function createElementByUploadedFile(uploadFile: PebUploadedFile): PebElementDef {
  const fill = getFillByUploadedFile(uploadFile);

  const element: PebElementDef = {
    id: '',
    index: 0,
    next: null,
    prev: null,
    styles: {
      [PEB_ROOT_SCREEN_KEY]: {
        dimension: {
          width: getPebSize(100),
          height: getPebSize(100),
        },
        fill,
        mediaType: uploadFile.fileType,
        position: {
          type: PebPositionType.Default,
          left: { unit: PebUnit.Pixel, value: undefined },
          top: { unit: PebUnit.Pixel, value: undefined },
        },
      },
    },
    type: PebElementType.Shape,
    data: {
      version: lastMigrationVersion,
    },
  };

  return element;
}

export function getFillByUploadedFile(file: PebUploadedFile): PebFill | undefined {
  const fillResolver = fillResolvers[file.fileType];

  return fillResolver?.(file);
}

function getImageFill({ url, mimeType }: PebUploadedFile): PebImageFill {
  return {
    type: PebFillType.Image,
    fillMode: PebFillMode.Fit,
    url,
    fillColor: null,
    mimeType,
  };
}

function getVideoFill({ url, mimeType, preview }: PebUploadedFile): PebVideoFill {
  return {
    type: PebFillType.Video,
    fillMode: PebFillMode.Fit,
    url,
    fillColor: null,
    mimeType,
    autoplay: false,
    controls: false,
    loop: false,
    preview,
    sound: false,
  };
}
