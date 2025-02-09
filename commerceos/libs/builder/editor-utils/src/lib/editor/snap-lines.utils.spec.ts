import { PebElement, PebLinkedList } from '@pe/builder/render-utils';
import { PEB_DEFAULT_PADDING } from '../..';
import { PebElementType } from '../../../../core/src';
import { detectSnapLines, getSnapPoints } from './snap-lines.utils';


describe('SnapLine Tools', () => {
  it('should return empty snap points for document', () => {
    const document = {
      id: '1',
      type: PebElementType.Document,
    } as PebElement;

    const points = getSnapPoints(document, []);

    expect(points).toEqual([]);
  });

  it('should return 5 points for element', () => {

    const children = new PebLinkedList<PebElement>();
    children.add({
      minX: 20,
      maxX: 160,
      minY: 40,
      maxY: 160,
      styles: { padding: PEB_DEFAULT_PADDING },
    } as PebElement);

    const document = {
      type: PebElementType.Document,
      children,
    } as PebElement;

    const points = getSnapPoints(document, [], { includeCenters: true });

    expect(points.length).toEqual(6);
    expect(points[0]).toEqual({ x: 20, y: 40, type: 'corner', 'peerX': 160, peerY: 160, });

  })

  it('should match top line & calculate transform', () => {
    const children = new PebLinkedList<PebElement>();
    children.add({
      id: '2',
      minX: 20,
      maxX: 160,
      minY: 40,
      maxY: 160,
      styles: { padding: PEB_DEFAULT_PADDING },
    } as PebElement);

    const document = {
      id: '1',
      type: PebElementType.Document,
      children,
    } as PebElement;

    const detect = detectSnapLines(
      { minX: 200, minY: 42, maxX: 500, maxY: 500 },
      getSnapPoints(document, []),
      { move: { top: true, right: true, bottom: true, left: true } }
    );

    expect(detect.transform?.moveX).toEqual(0);
    expect(detect.transform?.moveY).toEqual(-2);

  })
})
