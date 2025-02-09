import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';

import { PebRenderContainer, PebViewVector } from '@pe/builder/core';
import { getBackgroundCssStyles, getBorderCssStyles, getVectorInlineStyle } from '@pe/builder/render-utils';

@Component({
  selector: 'peb-vector-element',
  template: ` 
    <svg [attr.viewBox]="viewBox" [attr.viewBox]="viewBox" class="svg-{{id}}">
      <style>{{ style }}</style>
      <path [id]="'vector-'+id" [attr.d]="vector.vector.path"></path>
    </svg>
  `,
  styles: [
  `
    svg {
      position: absolute;
      top: 0;
    }
  `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebVectorElementComponent implements OnChanges {
  @Input() id!: string;
  @Input() vector!: PebViewVector;
  @Input() container!: PebRenderContainer;

  viewBox = '0 0 0 0';
  style = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.vector?.currentValue) {
      this.vector = changes.vector?.currentValue;
      this.style = this.container?.editMode
        ? getVectorInlineStyle(`vector-${this.id}`, this.vector.styles)
        : '';
      this.viewBox = `0 0 ${this.vector.vector?.viewBox?.width ?? 0} ${this.vector.vector?.viewBox?.height ?? 0}`;
    }
  }

  private needToRender(prev: PebViewVector, curr: PebViewVector): boolean {
    if (!prev) {
      return true;
    }

    if (prev.vector.path !== curr.vector.path) {
      return true;
    }
    
    const prevStyles = {
      ...getBorderCssStyles(prev.styles),
      ...getBackgroundCssStyles(prev.styles.fill),
    };
    
    const currStyles = {
      ...getBorderCssStyles(curr.styles),
      ...getBackgroundCssStyles(curr.styles.fill),
    };

    if (
      prevStyles.border !== currStyles.border ||
      prevStyles.background !== currStyles.background ||
      prevStyles.backgroundColor !== currStyles.backgroundColor ||
      prevStyles.backgroundImage !== currStyles.backgroundImage ||
      prevStyles.backgroundSize !== currStyles.backgroundSize
    ) {
      return true;
    }

    return false;
  }
}
