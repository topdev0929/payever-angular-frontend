import { PebContextRendererType, PebFillType } from "@pe/builder/core"
import { getContextRenderUpdates } from "./context-render.utils"

describe('Context render utils', () => {
  it('should render image value', () => {
    const imageUrl = 'http://test-image.jpg';
    const element = { id: '1', defs: { pebStyles: { desktop: { fill: { type: PebFillType.Image } } } } } as any;

    const updates = getContextRenderUpdates(element,
      {
        id: '1',
        integration: {
          renderConfigs: [
            { type: PebContextRendererType.Image },
          ]
        },
        value: imageUrl,
      });

    expect(updates).toEqual([{ id: '1', style: { host: { backgroundImage: `url('${imageUrl}')` } } }]);
  });

  it('should render text value', () => {
    const text = 'sample text';
    const element = { id: '1', text: '-empty-' } as any;

    const updates = getContextRenderUpdates(element,
      {
        id: '1',
        integration: {
          renderConfigs: [
            { type: PebContextRendererType.Text },
          ]
        },
        value: text,
      });

    expect(updates).toEqual([{ id: '1', text }]);
  });

  it('should render for hidden element', () => {
    const element = { id: '1' } as any;

    const updates = getContextRenderUpdates(element,
      {
        id: '1',
        integration: {
          renderConfigs: [
            { type: PebContextRendererType.Hidden },
          ]
        },
        value: {},
      });

    expect(updates).toEqual([{ id: '1', style: { host: { display: 'none' } } }]);
  });

})