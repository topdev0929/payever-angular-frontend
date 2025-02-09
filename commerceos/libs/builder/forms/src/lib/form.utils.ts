import { PebElementDef, PebFieldSchema, PebMap } from '@pe/builder/core';
import { PebElement } from '@pe/builder/render-utils';

import { PebContextFieldTree, PebIntegrationTreeItem } from './integrations';
import { PebFormOption } from './models';


export function elementToOption(elm: PebElement | PebElementDef): PebFormOption {
  return { name: elm.name ?? '', value: elm.id };
}

export function flattenIntegrationTree(tree: PebIntegrationTreeItem): PebMap<PebIntegrationTreeItem> {
  const map: PebMap<PebIntegrationTreeItem> = {};
  flattenIntegrationRecursive(tree, map);

  return map;
}

export function flattenIntegrationRecursive(tree: PebIntegrationTreeItem, map: PebMap<PebIntegrationTreeItem>) {
  if (!tree) {
    return;
  }
  map[tree.id] = tree;
  tree.children?.forEach(item => flattenIntegrationRecursive(item, map));
}

export function toContextFieldTree(field: PebFieldSchema, parent?: PebFieldSchema): PebContextFieldTree {
  const parentSchema: PebContextFieldTree = {
    id: parent?.name ?? 'parent',
    children: [],
    schema: parent,
    fullTitle: parent?.title,
    title: parent?.title,
    value: parent?.name,
    parent: undefined,
    dataType: field.dataType,    
  };

  return toContextFieldTreeRecursive(field, parentSchema);
}

function toContextFieldTreeRecursive(field: PebFieldSchema, parent?: PebContextFieldTree): PebContextFieldTree {
  const expression = [parent?.value, field.name].filter(Boolean).join('.');

  const result: PebContextFieldTree = {
    id: expression,
    title: field.title,
    fullTitle: [parent?.fullTitle, field.title].filter(Boolean).join('>'),
    schema: field,
    parent,
    value: expression,
    children: [],
    dataType: field.dataType,
  };

  field.fields && (result.children = field.fields.map(f => toContextFieldTreeRecursive(f, result)));

  return result;
}

