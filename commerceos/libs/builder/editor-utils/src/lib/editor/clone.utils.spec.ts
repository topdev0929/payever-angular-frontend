import { PebElementDef, PebElementType } from '@pe/builder/core'
import { cloneElementDef } from '../..';

describe('Clone utils:', () => {
  it('should clone single PebElementDef', () => {
    const element: PebElementDef = {
      type: PebElementType.Grid,
      id: 'test-1',
      index: 10,
      data: {
        fullWidth: true,
      },
      versionNumber: 44,
      styles: {
        desktop: {
          opacity: 10,
        },
        mobile: {
          opacity: 12,
        }
      },
    } as any;

    let cloned1 = cloneElementDef(element);
    let cloned2 = cloneElementDef(element);
    let cloned3 = cloneElementDef(element);
    let cloned4 = cloneElementDef(element);
    let cloned5 = cloneElementDef(element);

    expect(cloned1.id).toEqual(element.id);
    expect(cloned2.id).toEqual(element.id);
    expect(cloned3.id).toEqual(element.id);
    expect(cloned4.id).toEqual(element.id);
    expect(cloned5.id).toEqual(element.id);

    const id = element.id;
    expect({ ...cloned1, id }).toEqual(element);
    expect({ ...cloned2, id }).toEqual(element);
    expect({ ...cloned3, id }).toEqual(element);
    expect({ ...cloned4, id }).toEqual(element);
    expect({ ...cloned5, id }).toEqual(element);
  });
});
