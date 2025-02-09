
import { calculateViewPort, getBBoxPointer, calculateMountScroll, moveContentCenter, scaleViewport } from './view-port.utils';

describe('View port Utils', () => {
  it('should calculate stage based on bboxes', () => {
    const children = [
      { type: 'section', minX: 0, minY: 0, maxX: 100, maxY: 100 } as any,
      { type: 'section', minX: 0, minY: 100, maxX: 100, maxY: 200 } as any,
      { type: 'shape', minX: -100, minY: -100, maxX: 100, maxY: 100 } as any,
      { type: 'shape', minX: 500, minY: 500, maxX: 600, maxY: 700 } as any,
    ];

    const scale = 1;
    const containerWidth = 200;
    const containerHeight = 300;
    expect(calculateViewPort(children, scale, { width: containerWidth, height: containerHeight })).toEqual({
      width: 700 + 2 * containerWidth,
      height: 800 + 2 * containerHeight,
      offsetX: 100,
      offsetY: 100,
      containerWidth,
      containerHeight,
      page: { width: 100, height: 200, originalWidth: 100, originalHeight: 200 },
      totalArea: { minX: -100, minY: -100, maxX: 600, maxY: 700 },
      scale,
    });
  });

  it('should calculate stage when scale', () => {
    const children = [
      { type: 'section', minX: 0, minY: 0, maxX: 100, maxY: 100 } as any,
      { type: 'section', minX: 0, minY: 100, maxX: 100, maxY: 200 } as any,
      { type: 'shape', minX: -100, minY: -100, maxX: 100, maxY: 100 } as any,
      { type: 'shape', minX: 500, minY: 500, maxX: 600, maxY: 700 } as any,
    ];

    const scale = 2;
    const containerWidth = 200;
    const containerHeight = 300;
    expect(calculateViewPort(children, scale, { width: containerWidth, height: containerHeight })).toEqual({
      width: 1400 + 2 * containerWidth,
      height: 1600 + 2 * containerHeight,
      offsetX: 200,
      offsetY: 200,
      containerWidth,
      containerHeight,
      page: { width: 200, height: 400, originalWidth: 100, originalHeight: 200 },
      totalArea: { minX: -100, minY: -100, maxX: 600, maxY: 700 },
      scale,
    });
  });

  it('should move content to center', () => {
    const stage = {
      width: 500,
      height: 400,
      offsetX: 0,
      offsetY: 0,
      containerWidth: 0,
      containerHeight: 0,
      page: {
        width: 100,
        height: 200,
        originalWidth: 100,
        originalHeight: 200,
      },
      totalArea: {
        minX: -100,
        minY: -50,
        maxX: 100,
        maxY: 200,
      },
      scale: 1,
    };

    expect(moveContentCenter(stage)).toEqual({
      width: 500,
      height: 400,
      offsetX: 250,
      offsetY: 125,
      containerWidth: 0,
      containerHeight: 0,
      page: {
        width: 100,
        height: 200,
        originalWidth: 100,
        originalHeight: 200,
      },
      totalArea: {
        minX: -100,
        minY: -50,
        maxX: 100,
        maxY: 200,
      },
      scale: 1,
    });
  });

  it('should calculate scaled viewport', () => {
    const viewport = {
      containerWidth: 700,
      containerHeight: 800,
      page: { originalWidth: 350, originalHeight: 400 },
      totalArea: { minX: 0, minY: 0, maxX: 350, maxY: 400 },
      scale: 1,
    } as any;

    expect(scaleViewport(viewport, 2)).toEqual({

      containerWidth: 700,
      containerHeight: 800,

      width: 700 + 700 + 700,
      height: 800 + 800 + 800,

      offsetX: 700,
      offsetY: 800,

      page: { width: 700, height: 800, originalWidth: 350, originalHeight: 400 },
      totalArea: { minX: 0, minY: 0, maxX: 350, maxY: 400 },
      scale: 2,
    });
  });

  it('should calculate bboxPoint of viewport', () => {
    const viewport = {
      scale: 2,
      offsetX: 500,
      offsetY: 400,
    } as any;

    const scroll = { scrollLeft: 100, scrollTop: 0 };
    const clientPoint = { clientX: 400, clientY: 400 };

    expect(getBBoxPointer(viewport, scroll, clientPoint)).toEqual({ x: 0, y: 0 });
  });

  it('should calculate scroll to mount the viewpoint', () => {
    const viewport = {
      scale: 2,
      offsetX: 500,
      offsetY: 400,
    } as any;

    const bboxPoint = { x: 0, y: 0 };
    const clientPoint = { clientX: 400, clientY: 400 };

    expect(calculateMountScroll(viewport, bboxPoint, clientPoint)).toEqual({ scrollLeft: 100, scrollTop: 0 });
  });

});