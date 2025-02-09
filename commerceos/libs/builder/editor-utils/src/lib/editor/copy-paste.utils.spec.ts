import { PebPasteTypes } from '../../../../core/src';
import { detectPasteType } from './copy-paste.utils';

describe('Copy-Paste utils: convert element to text', () => {
  it('should detect paste type as svg', () => {
    const text = '<svg></svg>';
    expect(detectPasteType(text)).toEqual(PebPasteTypes.SVG);
  });

  it('should detect paste type as elements', () => {
    const text = '{"elements": [] }';
    expect(detectPasteType(text)).toEqual(PebPasteTypes.ElementDef);
  });

  it('should detect invalid paste types', () => {
    const invalids = [
      '{"element": [] }',
      '{"element"',
      'html',
    ];
    invalids.forEach(txt => expect(detectPasteType(txt)).toBeUndefined());
  });

});