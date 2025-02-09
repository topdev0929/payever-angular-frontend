import { VIRTUAL_SCROLL_STRATEGY, VirtualScrollStrategy } from '@angular/cdk/scrolling';
import { Directive, forwardRef, Input } from '@angular/core';

import { PeChatMessage } from '@pe/shared/chat';

import { PeChatMessageVirtualScrollStrategy } from './pe-auto-size-virtual-scroll-strategy';

const messageScrollStrategyFactory =
  (directive: PeMessageVirtualScrollDirective): VirtualScrollStrategy => directive.scrollStrategy;


@Directive({
  selector: '[peAutoSizeVirtualScrollDirective]',
  providers: [
    {
      provide: VIRTUAL_SCROLL_STRATEGY,
      useFactory: messageScrollStrategyFactory,
      deps: [forwardRef(() => PeMessageVirtualScrollDirective)],
    },
  ],
})
export class PeMessageVirtualScrollDirective {
  scrollStrategy = new PeChatMessageVirtualScrollStrategy();

  @Input()
  set messages(value: PeChatMessage[]) {
    value && this.scrollStrategy.messages$.next([...value]);
  }
}
