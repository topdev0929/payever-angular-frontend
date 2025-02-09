import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ContactsService {

  openFolderSubject$ = new BehaviorSubject(null);
  openFolder$ = this.openFolderSubject$.asObservable();
  set openFolder(value) {
    this.openFolderSubject$.next(value);
  }

  constructor(
  ) { }

  searchinarray(nodeList, id): any {
    for (const node of nodeList) {
      const item = this.searchInTree(node, id);
      if (item) { return item; }
    }
    return null;
  }

  searchInTree(node, id): any {
    if (!id) { return null; }
    if (node?.id === id) {
      return node;
    }
    if (node?.children !== null) {
      let i;
      let result = null;
      for (i = 0; result === null && i < node.children.length; i += 1) {
        result = this.searchInTree(node.children[i], id);
      }
      return result;
    }
    return null;
  }
}
