import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { v4 as uuidV4 } from 'uuid';

import { DevModeService } from '../../../../dev';

interface HandledNodeInterface {
  id: string;
  selector: string;
  node: HTMLElement;
}

@Component({
  selector: 'pe-prevent-double-tap-zoom-cdk-overlay',
  templateUrl: './prevent-double-tap-zoom-cdk-overlay.component.html'
})
export class PreventDoubleTapZoomCdkOverlay implements OnInit, OnDestroy {

  readonly cdkOverlayContainerSelector: string = '.cdk-overlay-container';

  readonly domChangeObserverSelector: string = 'body';
  readonly domChange$: Subject<void> = new Subject();

  readonly destroyed$: Subject<boolean> = new Subject();

  readonly handledContainers: Map<string, HandledNodeInterface> = new Map();
  readonly handledContainersArray$: Subject<HandledNodeInterface[]> = new Subject();

  private readonly datasetAttributeKey: string = 'handled-cdk-overlay-id';
  private readonly datasetPropertyKey: string = this.convertDataSetProperty(this.datasetAttributeKey);

  constructor(
    private devMode: DevModeService,
  ) {}

  ngOnInit(): void {
    this.handleExistingContainers();

    this.destroyed$
      .subscribe(() => this.unhandleAllContainers());

    const stopWatching: () => void = this.watchMutations();

    this.domChange$
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => this.visitOverlayContainers());

    this.destroyed$
      .subscribe(stopWatching);
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  private watchMutations(): () => void {
    const observer: MutationObserver = new MutationObserver(
      () => this.domChange$.next()
    );

    const config: MutationObserverInit = {
      childList: true,
    };

    const cdkParentNode: HTMLElement = document.querySelector(this.domChangeObserverSelector);

    if (!cdkParentNode) {
      if (this.devMode.isDevMode()) {
        // tslint:disable-next-line no-console
        console.warn('CDK parent node not found');
      }
    } else {
      observer.observe(cdkParentNode, config);
    }

    return observer.disconnect.bind(observer);
  }

  private visitOverlayContainers(): void {
    const found: HTMLElement[] = Array.from(
      document.querySelectorAll(this.cdkOverlayContainerSelector)
    );

    const visitedIds: string[] = found.reduce(
      (visitedIds, node) => {
        let id: string = node.dataset[this.datasetPropertyKey];
        if (!id) {
          id = this.handleContainer(node).id;
        }
        return visitedIds.concat(id);
      },
      []
    );

    // Auto-unhandle
    Array.from(this.handledContainers.values())
      .filter(({ id }) => !visitedIds.includes(id))
      .forEach(handledNode => this.unhandleContainer(handledNode));
  }

  private handleExistingContainers(): void {
    const existContainers: HTMLElement[] = Array.from(
      document.querySelectorAll(this.cdkOverlayContainerSelector)
    );
    existContainers.forEach(node => this.handleContainer(node));
  }

  private handleContainer(node: HTMLElement): HandledNodeInterface {
    const id: string = uuidV4();

    node.dataset[this.datasetPropertyKey] = id;

    const handledNode: HandledNodeInterface = {
      id,
      node,
      selector: this.nodeSelector(id)
    };

    this.handledContainers.set(id, handledNode);
    this.updateHandledContainersArray();

    return handledNode;
  }

  private unhandleAllContainers(): void {
    this.handledContainers.forEach(node => this.unhandleContainer(node));
  }

  private unhandleContainer({ id, node }: HandledNodeInterface): void {
    delete node.dataset[this.datasetPropertyKey];
    this.handledContainers.delete(id);
    this.updateHandledContainersArray();
  }

  private updateHandledContainersArray(): void {
    this.handledContainersArray$.next(Array.from(this.handledContainers.values()));
  }

  private convertDataSetProperty(prop: string): string {
    return prop.replace(/\-(\w)/g, (_, sym) => sym.toUpperCase());
  }

  private nodeSelector(id: string): string {
    return `[data-${this.datasetAttributeKey}="${id}"]`;
  }

}
