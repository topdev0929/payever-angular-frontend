import { PebElement, PebLinkedList } from '@pe/builder/render-utils';


export function pullElement(element: PebElement, master: PebElement | undefined) {
  if (!master) {
    return;
  }

  element.styles = { ...master.styles };
  const children = [...element.children ?? []];
  const masterChildren = [...master.children ?? []];

  const newChildren = new PebLinkedList<PebElement>();
  mixChildren(children, masterChildren).forEach((elm) => {
    elm.parent = element;
    newChildren.add(elm);
  });

  element.children = newChildren;
}

function mixChildren(elementChildren: PebElement[], masterChildren: PebElement[]): PebElement[] {
  const res = [...elementChildren];
  let position = 'top';
  let topIndex = 0;

  masterChildren.forEach((masterElm) => {
    if (masterElm.name?.toLowerCase().includes('head')) {
      position = 'top';
    }
    else if (masterElm.name?.toLowerCase().includes('foot')) {
      position = 'bottom';
    }

    position === 'top'
      ? res.splice(topIndex, 0, masterElm)
      : res.push(masterElm);

    position === 'top' && topIndex++;
  });

  return res;
}