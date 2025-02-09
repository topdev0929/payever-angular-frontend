import { PeStudioAlbum } from '../core/interfaces/studio-album.interface';
import { PeAttribute } from '../core/interfaces/studio-attributes.interface';
import { PeStudioCategory } from '../core/interfaces/studio-category.interface';

export const ALBUMS = 'albums';

export const mapAttributesToAlbums = (attributes: PeAttribute[], collection: PeStudioAlbum[], categoryType: string): PeStudioCategory[] => {
  const categories = [];
  const filtered = [
    {
      editing: false,
      listItems: [],
      active: false,
      subCategory: [],
      _id: '0',
      business: '',
      name: 'My Albums',
      iconUrl: '',
      tree: [],
    },

  ];

  filtered.forEach(attribute => {
    const tree = createTree(collection, categoryType);
    const category = {} as PeStudioCategory;
    category._id = attribute._id;
    category.active = false;
    category.name = attribute.name;
    category.tree = tree;
    category.listItems = tree;
    category.editing = false;
    category.active = false;
    categories.push(category);
  });

  return categories;
};


export const searchinArray = (nodeList, id) => {
  for (const node of nodeList) {
    const item = searchInTree(node, id);
    if (item) { return item; }
  }
  return null;
};

export const searchInTree = (node, id) => {
  if (!id) { return null; }
  if (node?.id === id) {
    return node;
  }
  if (node?.children != null) {
    let i;
    let result = null;
    for (i = 0; result == null && i < node.children.length; i++) {
      result = searchInTree(node.children[i], id);
    }
    return result;
  }
};


export const createTree = (list: any[], categoryType) => {
  const rootItems = [];

  const lookup = {};

  for (const item of list) {

    const itemId = item._id;
    const parentId = item.parent;

    if (!lookup[itemId]) { lookup[itemId] = { ['children']: [] }; }

    const newItem = {
      id: item._id,
      key: item._id,
      name: item.name,
      editing: false,
      active: false,
      parentId: item.parent,
      image: item.icon,
      data: item,
      noToggleButton: !item.hasChildren,
      category: categoryType,

    };


    lookup[itemId] = { ...newItem, ['children']: lookup[itemId].children };

    const TreeItem = lookup[itemId];
    if (parentId === null || parentId === undefined || parentId === '') {

      rootItems.push(TreeItem);
    } else {
      if (!lookup[parentId]) { lookup[parentId] = { ['children']: [] }; }
      lookup[parentId].children.push(TreeItem);
    }
  }
  return rootItems;
};


export const listTreeNode = (collection: PeStudioAlbum[], current: PeStudioAlbum) => {
  return collection.filter(album => album.parent === current._id).map(item => ({
    id: item._id,
    key: item._id,
    name: item.name,
    parentId: item.parent,
    image: item.icon,
    children: item.ancestors.length > 0 ? collection.filter(album => album.parent === item._id).map(e => listTreeNode(collection, e)) : [],
    data: item,
    category: 'albums',
  }));
};


export const mapAttributeToCategory = (attribute: PeAttribute, businessId: string): PeStudioCategory => {
  const category = {} as PeStudioCategory;
  category.tree = [];
  category._id = attribute._id;
  category.active = true;
  category.iconUrl = attribute.icon;
  category.editing = true;
  category.listItems = [];
  category.name = attribute.name;
  category.business = businessId;
  category.subCategory = [] as PeStudioCategory[];

  return category;
};

export const mapAlbumToTreeNode = (item: PeStudioAlbum, category: PeStudioCategory, collection: PeStudioAlbum[]) => {


  const treeNode = {
    id: item._id,
    key: item._id,
    name: item.name,
    data: item,
    parentId: item.parent,
    noToggleButton: !item.hasChildren,
    image: item.icon,
    categoryId: category._id,
    children: [],
    category: 'albums',
    editing: false,
  };
  return treeNode;
};

