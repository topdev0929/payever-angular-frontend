import { RGBA } from '@pe/builder/color-utils';
import { PEB_ROOT_SCREEN_KEY, PebElementType, PebFill, PebFillType } from '@pe/builder/core';
import { createElementDefByFill } from './factory.utils';
import { lastMigrationVersion } from '@pe/builder/migrations';
import { getPebSize } from '@pe/builder/render-utils';

describe('factory util', () => {
  it('must return element def when calling convertDroppedFileToElementDef', () => {
    const fill: PebFill = {
      type: PebFillType.Solid,
      color: new RGBA(1, 1, 1, 1),
    };

    const mediaType = 'image';

    const element = createElementDefByFill(fill, mediaType);

    const expected = {
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
          mediaType,
        },
      },
      type: PebElementType.Shape,
      data: {
        version: lastMigrationVersion,
      },
    };

    expect(element).toEqual(expected);
  });
});
