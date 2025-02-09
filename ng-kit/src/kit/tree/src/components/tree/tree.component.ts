import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { TreeInterface } from '../../interfaces';
import { ThemeType } from '../../enums';
import { of, Observable } from 'rxjs';

@Component({
  selector: 'pe-tree',
  templateUrl: 'tree.component.html',
})
export class TreeComponent {
  @Input() set treeData(treeData: TreeInterface[]) {
    this.nestedDataSource.data = treeData;
  }
  @Input() theme: ThemeType;
  @Output() onExpand: EventEmitter<TreeInterface> = new EventEmitter<TreeInterface>();
  nestedTreeControl: NestedTreeControl<TreeInterface>;
  nestedDataSource: MatTreeNestedDataSource<TreeInterface> =  new MatTreeNestedDataSource();

  constructor() {
    this.nestedTreeControl  = new NestedTreeControl<TreeInterface>(this.getChildren);
    this.nestedDataSource = new MatTreeNestedDataSource();
  }

  onExpandNode(node: TreeInterface) {
    this.onExpand.emit(node);
  }

  getLevel(node: TreeInterface): number {
    return node.level;
  }

  isExpandable(node: TreeInterface): boolean {
    return node.children && node.children.length > 0;
  }

  getChildren(node: TreeInterface): Observable<TreeInterface[]> {
    return of(node.children);
  }

  hasChild(nodeIndex: number, node: TreeInterface): boolean {
    return node.children != null && node.children.length > 0;
  }
}
