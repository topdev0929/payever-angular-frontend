import { PebContextRendererType, PebFillMode, PebFillType } from '@pe/builder/core';

import { PebContextEnabledElement } from '../models/context-renderer.model';

import { renderContext } from './context-render.tools';

describe('Renderer Service', () => {
  describe('context renderer', () => {
    it('should render image url', () => {
      const element: PebContextEnabledElement = {
        id: '1',
        styles: {
          fill: {
            type: PebFillType.Image,
            fillMode: PebFillMode.Fit,
          } as any,
        },
        context: { value: 'http://test-image' },
        integration: {
          renderConfigs: [
            {
              type: PebContextRendererType.Image,
            },
          ],
        },
      };

      const res = renderContext(element);

      expect(res).toEqual({
        styles: {
          fill: { type: 'image', fillMode: 'fit', url: 'http://test-image' } as any,
        },
      });
    });

    it('should render place holder', () => {
      const element: PebContextEnabledElement = {
        id: '1',
        styles: {},
        context: { value: undefined },
        integration: {
          renderConfigs: [
            {
              type: PebContextRendererType.Placeholder,
            },
          ],
        },
      };

      const res1 = renderContext(element);
      expect(res1).toEqual({ invisible: true });

      const res2 = renderContext({ ...element, context: { value: 'some value' } });
      expect(res2).toEqual({});
    });
  });
});
