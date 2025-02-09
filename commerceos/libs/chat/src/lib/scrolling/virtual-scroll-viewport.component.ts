import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import {
  Component,
  TemplateRef,
  ViewChild,
  ChangeDetectionStrategy,
  ViewContainerRef,
  Output,
  EventEmitter,
  Input,
} from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';
import { PeChatMessage } from '@pe/shared/chat';

export type ContentAlignment = 'top' | 'bottom';

@Component({
  selector: 'pe-virtual-scroll-viewport',
  templateUrl: './virtual-scroll-viewport.component.html',
  styleUrls: ['./virtual-scroll-viewport.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class VirtualScrollViewportComponent {
  private view: ViewContainerRef;
  items: PeChatMessage[] = [];
  public readonly items$ = new BehaviorSubject<PeChatMessage[]>([]);

  constructor(
    private readonly destroy$: PeDestroyService,
  ) {
    this.items$.pipe(
      tap(messages => this.items = messages),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  public itemTemplate: TemplateRef<any>;
  @Input() isLiveChat = false;


  @ViewChild('content') content: TemplateRef<object>;
  @ViewChild(CdkVirtualScrollViewport) virtualScroll: CdkVirtualScrollViewport;
  @Output() scrollIndexChange = new EventEmitter<number>();
  @Output() firstItemIndexChange = new EventEmitter<number>();
  @Input() contentAlignment: ContentAlignment = 'top';

  get isContentBottomAligned() {
    return this.contentAlignment === 'bottom';
  }

  public attachView(view: ViewContainerRef) {
    if (this.view) {
      return;
    }
    this.view = view;
    this.view.createEmbeddedView(this.content);
  }

  onScrolledIndexChange(data) {
    this.firstItemIndexChange.emit(data);
    if (data <= 10) {
      this.scrollIndexChange.emit(data);
    }
  }
}
