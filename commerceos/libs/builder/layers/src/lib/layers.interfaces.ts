import { PebElement } from '@pe/builder/render-utils';

export type LayerNode = LayerSingleNode | LayerGroupNode;

export abstract class BaseLayerNode {
  id: string;
  children: BaseLayerNode[];
  isVisible: boolean;
  name: string;
  isSelected: boolean;
  parent: string;
  canChangeVisible: boolean;
  type: LayerNodeType;
}

export class LayerSingleNode extends BaseLayerNode {
  element: PebElement;

  constructor(element: PebElement, parent?: string, parentIsVisible?: boolean) {
    super();

    this.name = element.name || element.type;
    this.element = element;
    this.id = element.id;
    this.isVisible = element.visible && (parentIsVisible ?? true);
    this.isSelected = false;
    this.parent = parent;
    this.canChangeVisible = parentIsVisible ?? true;
    this.type = LayerNodeType.Single;

    const children = [...element.children];
    const singleNodes = children
      .filter(child => !child.data?.groupId)
      .map(child => new LayerSingleNode(child, element.id, this.isVisible));
    const groupNodes = [];
    const groupedChildren = children.filter(child => !!child.data?.groupId);

    if (groupedChildren?.length) {
      groupNodes.push(new LayerGroupNode(groupedChildren, element.id, this.isVisible));
    }

    this.children = [...singleNodes, ...groupNodes];
  }
}

export class LayerGroupNode extends BaseLayerNode {
  elements: PebElement[];

  constructor(elements: PebElement[], parent?: string, parentIsVisible?: boolean) {
    super();

    this.name = LayerNodeType.Group;
    this.elements = elements;
    this.id = `${parent}-group-${elements[0].id}`;
    this.isVisible = elements.some(elm => elm.visible);
    this.isSelected = false;
    this.parent = parent;
    this.canChangeVisible = parentIsVisible ?? true;
    this.type = LayerNodeType.Group;

    this.children = elements.map(child => new LayerSingleNode(child, this.id, this.isVisible));
  }
}

export enum LayerNodeType {
  Single = 'single',
  Group = 'group',
}

export const isLayerSingleNode = (node: BaseLayerNode): node is LayerSingleNode => node?.type === LayerNodeType.Single;
export const isLayerGroupNode = (node: BaseLayerNode): node is LayerGroupNode => node?.type === LayerNodeType.Group;

export interface LayerFlatNode {
  expandable: boolean;
  name: string;
  level: number;
  id: string;
  type: LayerNodeType;
  elements: PebElement[];
  parent: string | null;
  isSelected: boolean;
  isVisible: boolean;
  canChangeVisible: boolean;
  canEditText: boolean;
}
