import { canAddText } from '@pe/builder/editor-utils';

import { BaseLayerNode, LayerFlatNode, isLayerGroupNode, isLayerSingleNode } from './layers.interfaces';
import { PebElement } from "@pe/builder/render-utils";

export const transformer = (node: BaseLayerNode, level: number): LayerFlatNode => {
  let elements: PebElement[] = [];
  if (isLayerSingleNode(node)) {
    elements = [node.element];
  } else if (isLayerGroupNode(node)) {
    elements = node.elements;
  }

  return {
    expandable: !!node.children && node.children.length > 0,
    name: node.name,
    level: level,
    type: node.type,
    elements,
    isVisible: node.isVisible,
    id: node.id,
    parent: node.parent,
    isSelected: node.isSelected,
    canChangeVisible: node.canChangeVisible,
    canEditText: isLayerSingleNode(node) ? canAddText(node.element) : false,
  };
};
