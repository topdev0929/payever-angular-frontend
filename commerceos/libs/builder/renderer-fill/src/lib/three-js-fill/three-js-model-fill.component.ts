import {
  ChangeDetectionStrategy,
  Component,
  ComponentFactoryResolver,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { from } from 'rxjs';
import { take, tap } from 'rxjs/operators';

import { PebRenderContainer, PebThreeJsFill } from '@pe/builder/core';

@Component({
  selector: 'peb-three-js-model-fill',
  templateUrl: './three-js-model-fill.component.html',
  styleUrls: ['./three-js-model-fill.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebThreeJsModelFillComponent implements OnChanges {
  @Input() model!: PebThreeJsFill;
  @Input() container?: PebRenderContainer;

  @ViewChild('rendererContainer', { read: ViewContainerRef }) private containerViewRef!: ViewContainerRef;

  constructor(
    private readonly componentFactory: ComponentFactoryResolver,
  ) {}

  ngOnChanges({ model }: SimpleChanges): void {
    if (model?.currentValue && model.currentValue.url !== model.previousValue?.url) {
      if (!this.container?.editMode) {
        this.loadRenderer();
      }
    }
  }

  private loadRenderer(): void {
    from(import(`@pe/threejs`)).pipe(
      tap(({ ThreejsRendererComponent }) => {
        const componentFactory = this.componentFactory.resolveComponentFactory(ThreejsRendererComponent);
        const componentRef = this.containerViewRef.createComponent(componentFactory);
        componentRef.instance.model = this.model;
        componentRef.changeDetectorRef.detectChanges();
      }),
      take(1),
    ).subscribe();
  }
}
