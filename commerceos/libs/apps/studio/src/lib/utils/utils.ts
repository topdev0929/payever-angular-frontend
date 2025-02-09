import { TreeFilterNode } from '@pe/common';

import { MediaType } from '../core';


export function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function dynamicSort(property, sortOrder = 1) {
  return (a, b) => {
    let result;
    if (typeof a[property] === 'string' || a[property] instanceof String) {
      if (a[property].toLowerCase() < b[property].toLowerCase()) {
        result = -1;
      } else if (a[property].toLowerCase() > b[property].toLowerCase()) {
        result = 1;
      } else {
        result = 0;
      }
    } else {
      if ((a[property] < b[property])) {
        result = -1;
      } else if ((a[property] > b[property])) {
        result = 1;
      } else {
        result = 0;
      }
    }

    return result * sortOrder;
  };
}

export function sortByField(array: any[], sortOptions: { order: string, param: string }) {
  const sortOrder = sortOptions.order === 'asc' ? 1 : -1;

  return sortOptions ? array.sort(dynamicSort(sortOptions.param, sortOrder)) : array;
}

export function listToTree(list: TreeFilterNode[]) {
  const map = {};
  const roots = [];

  for (let i = 0; i < list.length; i ++) {
    map[list[i].id] = i; // initialize the map
    list[i].children = []; // initialize the children
  }

  for (const node of list) {
    if (node.parentId !== null) {
      // if you have dangling branches check that map[node.parentId] exists
      list[map[node.parentId]]?.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

export function searchInTree(tree, value, key = 'id', reverse = false) {
  const stack = [ tree[0] ];
  while (stack.length) {
    const node = stack[reverse ? 'pop' : 'shift']();
    if (node[key] === value) {
      return node;
    }
    if (node.children) {
      stack.push(...node.children);
    }
  }

  return null;
}

const containerMap: Partial<Record<MediaType, string>> = {
  [MediaType.Image]: 'images',
  [MediaType.Video]: 'builder-video',
};

const mediaTypePatterns = {
  Image: /^image\//,
  Video: /^video\//,
  Script: /^text\/javascript$/,
  Model: /\.glb$/i,
};

export function determineMediaType(file: File): MediaType {
  for (const [type, pattern] of Object.entries(mediaTypePatterns)) {
    if (pattern.test(file.type) || pattern.test(file.name)) {
      return MediaType[type];
    }
  }

  return MediaType.File;
}

export function generateEndpointUrl(mediaType: MediaType, baseApiUrl: string, businessId: string): string {
  const container = containerMap[mediaType];

  return container ? `${baseApiUrl}/${mediaType}/business/${businessId}/${container}` :
    `${baseApiUrl}/file/business/${businessId}/studio/application/${businessId}`;
}

export function generatePreviewUrl(mediaType: MediaType, response: any, storageBaseUrl: string): string | undefined {
    const container = containerMap[mediaType];

    return containerMap[mediaType] ?
      `${storageBaseUrl}/${container}/${response.body.blobName}` :
      `${storageBaseUrl}/studio/${response.body.blobName}`;
}

export function getAcceptType(type: string): string {
  switch (type) {
    case 'text/javascript':
      return MediaType.Script;
    case 'model/gltf-binary':
      return MediaType.Model;
    case MediaType.Image:
      return 'image/*';
    case MediaType.Video:
      return 'video/*';
    default:
      return '*/*';
  }
}
