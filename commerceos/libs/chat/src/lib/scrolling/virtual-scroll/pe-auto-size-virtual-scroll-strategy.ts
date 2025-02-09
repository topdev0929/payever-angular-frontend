import {
  CdkVirtualScrollViewport,
  VirtualScrollStrategy,
} from '@angular/cdk/scrolling';
import { inject } from '@angular/core';
import { BehaviorSubject, Observable, Subject, merge } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  takeUntil,
  tap,
} from 'rxjs/operators';

import { PeMessageChatService, PeMessageAppService } from '@pe/message/shared';
import { PeChatMessage } from '@pe/shared/chat';


interface MessageHeight {
  value: number;
  source: 'predicted' | 'actual';
}

const PADDING_ABOVE = 37;
const PADDING_BELOW = 5;
const MESSAGE_TOP_MARGIN = 8;

export class PeChatMessageVirtualScrollStrategy implements VirtualScrollStrategy {
  private peMessageAppService: PeMessageAppService;
  private peMessageChatService: PeMessageChatService;
  private canRequestScroll = true;

  constructor() {
    this.peMessageAppService = inject(PeMessageAppService);
    this.peMessageChatService = inject(PeMessageChatService);

    this.messages$.pipe(
      debounceTime(10),
      tap(()=>{
        this.viewport.checkViewportSize();
      }),
      distinctUntilChanged((a, b) =>
      a[0]?.chat === b[0]?.chat &&  a.length >= b.length && a[0].isPin === b[0].isPin
      ),
      tap(()=>{
        if (this.canRequestScroll) {
          const behavior = this.viewport.measureScrollOffset("bottom") < 500 ? "smooth" : "auto";
          setTimeout(() => {
            this.viewport.scrollTo({
              bottom: 0,
              behavior,
            });
          });
          setTimeout(() => {
            this.viewport.scrollTo({
              bottom: 0,
              behavior,
            });
          }, 100);
        }
        else {
          this.scrollToIndex(PADDING_ABOVE + MESSAGE_TOP_MARGIN, "auto");
        }
      }),
      takeUntil(this.destroy$),
    ).subscribe();

    this.peMessageAppService.selectedChannel$.pipe(
      distinctUntilChanged((a, b) => a.channel?._id === b.channel?._id),
      tap(()=> {
        this.canRequestScroll = true;
      }),
      takeUntil(this.destroy$),
    ).subscribe();

    const onUpdateMessagesCache$ = this.updateMessagesCache$.pipe(
      debounceTime(10),
      map(() => Array.from(this.wrapper?.childNodes).filter((node: HTMLElement) =>
        node.nodeName === 'PE-CHAT-MESSAGE' &&
        !this.hasCachedHeight(node.getAttribute('data-msg-id'))
      )),
      filter((nodes: HTMLElement[]) => nodes.length > 0),
      tap((nodes: HTMLElement[]) => {
        nodes.forEach((node: HTMLElement) => {
          const id: string = node.getAttribute('data-msg-id');

          const height = node.clientHeight + MESSAGE_TOP_MARGIN;

          this.heightCache.set(id, { value: height, source: 'actual' });
        });
        if (!this.viewport) { return; }
        this.viewport.setTotalContentSize(this.getTotalHeight());

        const range = this.viewport.getRenderedRange();
        this.viewport.setRenderedContentOffset(this.getOffsetByMsgIdx(range.start || 0));
      }),
    );

    const onScrolled$ = this.scrolledIndexChange.pipe(
      filter(() =>
        !!this.viewport &&
        !!this.wrapper &&
        this.messages.length > 0
      ),
      tap((scrollIndex)=> {
        if (scrollIndex === 0) {
          return;
        }
        if (scrollIndex > MESSAGE_TOP_MARGIN) {
          this.canRequestScroll = true;
        }
        else if (this.canRequestScroll) {
          this.peMessageAppService.scrollRequest();
          this.canRequestScroll = false;
        }
      }),
      map(() => this.messages$.getValue()),
      tap((nodes) => {
        const firstVisibleIdx = this.getMsgIdxByOffset(this.viewport.measureScrollOffset());
        const visibleCount = this.determineMsgsCountInViewport(firstVisibleIdx);

        for (let i = firstVisibleIdx; i <= firstVisibleIdx + visibleCount; i++) {
          if (nodes[i] && !this.peMessageChatService.isMessageRead(nodes[i],this.peMessageAppService.userId)){
            this.peMessageAppService.readMessage(nodes[i]);
          }
        }
      }),
    );

    merge(
      onUpdateMessagesCache$,
      onScrolled$,
    ).pipe(
      takeUntil(this.destroy$)
    ).subscribe();
  }

  private _scrolledIndexChange$ = new Subject<number>();
  public scrolledIndexChange: Observable<number> = this._scrolledIndexChange$.pipe(
    distinctUntilChanged(),
  );

  public messages$ = new BehaviorSubject<PeChatMessage[]>([]);
  private viewport!: CdkVirtualScrollViewport | null;
  private wrapper!: ChildNode | null;
  private heightCache = new Map<string, MessageHeight>();
  private updateMessagesCache$ = new Subject();
  private destroy$ = new Subject();
  private onDataLengthChanged$ = new Subject();

  attach(viewport: CdkVirtualScrollViewport): void {
    this.viewport = viewport;
    this.wrapper = viewport.getElementRef().nativeElement.childNodes[0];
    if (this.messages) {
      this.viewport.setTotalContentSize(this.getTotalHeight());
      this.updateRenderedRange();
    }
  }

  detach(): void {
    this.viewport = null;
    this.wrapper = null;
    this.destroy$.next();
    this.heightCache.clear();
  }

  onContentScrolled(): void {
    if (this.viewport) {
      this.updateRenderedRange();
    }
  }

  onDataLengthChanged(): void {
    if (!this.viewport) {
      return;
    }

    this.viewport.setTotalContentSize(this.getTotalHeight());
    this.updateRenderedRange();

    this.onDataLengthChanged$.next();
  }

  onContentRendered(): void {
    // no uncase
  }

  onRenderedOffsetChanged(): void {
    // no uncase
  }

  scrollToIndex(index: number, behavior: ScrollBehavior): void {
    if (!this.viewport) {
      return;
    }

    const offset = this.getOffsetByMsgIdx(index);
    this.viewport.scrollToOffset(offset, behavior);
  }

  private hasCachedHeight(id: string): boolean {
    const cachedHeight = this.heightCache.get(id);

    return cachedHeight && cachedHeight.source === 'actual';
  }

  private getTotalHeight(): number {
    return this.measureMessagesHeight(this.messages);
  }


  private getOffsetByMsgIdx(idx: number): number {
    return this.measureMessagesHeight(this.messages.slice(0, idx));
  }

  private getMsgIdxByOffset(offset: number): number {
    let acumenOffset = 0;

    for (let i = 0; i < this.messages.length; i++) {
      const msg = this.messages[i];
      const msgHeight = this.getMsgHeight(msg);
      acumenOffset += msgHeight;

      if (acumenOffset >= offset) {
        return i;
      }
    }

    return 0;
  }


  private measureMessagesHeight(messages: PeChatMessage[]): number {
    return messages
      .map(m => this.getMsgHeight(m))
      .reduce((acc, next) => acc + next, 0);
  }


  private determineMsgsCountInViewport(startIdx: number): number {
    if (!this.viewport) {
      return 0;
    }

    let totalSize = 0;
    const viewportSize = this.viewport.getViewportSize();

    for (let i = startIdx; i < this.messages.length; i++) {
      const msg = this.messages[i];
      totalSize += this.getMsgHeight(msg);

      if (totalSize >= viewportSize) {
        return i - startIdx;
      }
    }

    return this.viewport.getDataLength();
  }


  private updateRenderedRange() {
    if (!this.viewport) {
      return;
    }
    const scrollOffset = this.viewport.measureScrollOffset();
    const scrollIdx = this.getMsgIdxByOffset(scrollOffset);
    const dataLength = this.viewport.getDataLength();
    const range = {
      start: Math.max(0, scrollIdx - PADDING_ABOVE),
      end: Math.min(
        dataLength,
        scrollIdx + this.determineMsgsCountInViewport(scrollIdx) + PADDING_BELOW,
      ),
    };

    this.viewport.setRenderedRange(range);
    this.viewport.setRenderedContentOffset(
      this.getOffsetByMsgIdx(range.start),
    );
    this._scrolledIndexChange$.next(scrollIdx);

    this.updateMessagesCache$.next();
  }

  private getMsgHeight(m: PeChatMessage): number {
    let height = 67;
    const cachedHeight = this.heightCache.get(m._id);

    if (!cachedHeight) {
      this.heightCache.set(m._id, { value: height, source: 'predicted' });
    } else {
      height = cachedHeight.value;
    }

    return height;
  }

  private get messages(): PeChatMessage[] {
    return this.messages$.getValue();
  }
}
