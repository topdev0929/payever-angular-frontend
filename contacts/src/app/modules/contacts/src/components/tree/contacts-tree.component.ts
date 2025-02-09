import { NestedTreeControl } from '@angular/cdk/tree';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  EventEmitter,
  Input,
  OnInit,
  Output,
  TemplateRef,
} from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { DomSanitizer } from '@angular/platform-browser';
import { takeUntil } from 'rxjs/operators';

import { TreeFilterNode } from '@pe/common';

import { AbstractComponent } from '../../misc/abstract.component';
import { ContactsService } from '../../services';

@Component({
  selector: 'peb-contacts-tree',
  templateUrl: './contacts-tree.component.html',
  styleUrls: ['./contacts-tree.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebContactsTreeComponent extends AbstractComponent implements OnInit {
  @Input() set tree(tree) {
    this.treeFilter = tree;

    if (!!tree) {
      this.dataSource.data = tree;
    }
  }

  @Output() renameNode = new EventEmitter<TreeFilterNode>();

  treeFilter: TreeFilterNode[];
  @ContentChild('nodeImageTemplate') nodeImageTemplate: TemplateRef<any>;

  readonly dataSource = new MatTreeNestedDataSource<TreeFilterNode>();
  readonly treeControl: NestedTreeControl<TreeFilterNode> =
    new NestedTreeControl<TreeFilterNode>(node => node.children);
  activeAlbum: string;

  constructor(
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
    private contactsService: ContactsService,
  ) {
    super();
    this.matIconRegistry.addSvgIcon(
      'tree-arrow-icon',
      this.domSanitizer.bypassSecurityTrustResourceUrl(`/assets/tree-arrow-icon.svg`),
    );

  }

  ngOnInit(): void {
    this.contactsService.openFolder$.pipe(
      takeUntil(this.destroyed$),
    ).subscribe((id: string) => {
      this.activeAlbum = id;
      const expandableNode = this.contactsService.searchinarray(this.treeFilter, id);
      if (expandableNode) { this.expand(expandableNode); }
      this.cdr.markForCheck();
    });
  }

  openFolder(e: Event, node: TreeFilterNode): void {
    e.stopPropagation();
    this.contactsService.openFolder = node.id;
  }

  expand(node: TreeFilterNode): void  {
    this.treeControl.expand(node);
    this.cdr.markForCheck();
  }
  hasChild = (_: number, node: TreeFilterNode) => node.children?.length;

  refreshTreeData(): void {
    const data = this.dataSource.data;
    this.dataSource.data = null;
    this.dataSource.data = data;

    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }

  onRenameNode(node: TreeFilterNode): void {
    node.editing = false;
    this.renameNode.emit(node);
  }

  onToggleExpanded(e, node): void {
    e.stopPropagation();
    e.preventDefault();
    if (this.treeControl.isExpanded(node)) {
      this.treeControl.collapse(node);
      return;
    }
    this.expand(node);
  }
}
