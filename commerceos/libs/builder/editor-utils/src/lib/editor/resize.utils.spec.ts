import { BBox } from 'rbush';
import { resizeElement } from '../..'
import { PebElementType, PebPositionType } from '@pe/builder/core'

describe('Resize Utils', () => {

  it('resize element based on given BBOX', () => {

    let parentBBox: BBox;

    const left = 20;
    const top = 50;
    const width = 80;
    const height = 60;

    parentBBox = {
      minX: 700,
      maxX: 800,
      minY: 1000,
      maxY: 1200,
    }

    const initialBBox = {
      minX: parentBBox.minX + left,
      maxX: parentBBox.minX + left + width,
      minY: parentBBox.minY + top,
      maxY: parentBBox.minY + top + height,
    }

    const element = {
      type: PebElementType.Shape,
      styles: {
        position: {
          type: PebPositionType.Default,
          left,
          top,
        },
        dimension: {
          width,
          height,
        }
      },
      ...initialBBox,
    } as any;

    const res = resizeElement(element, { scaleX: 0.5, scaleY: 0.25, moveX: 0, moveY: 0 }, { scalePercentSizes: false });

    expect(res?.resizedElement.minX).toEqual(720);
    expect(res?.resizedElement.maxX).toEqual(760);
    expect(res?.resizedElement.minY).toEqual(1050);
    expect(res?.resizedElement.maxY).toEqual(1065);
  })
})
