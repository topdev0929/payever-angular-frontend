import { ChangeDetectionStrategy, Component, ElementRef } from '@angular/core';

import { DevModeService } from '../../../dev';
import { AbstractRowComponent } from '../abstract-row';
import { FieldDecorationType } from '../../types';

const DECORATIONS: FieldDecorationType[] = ['error', 'warning', 'success'];

/**
 * @deprecated Should be removed after migration to fieldset
 */
@Component({
  selector: 'pe-form-row-table',
  templateUrl: 'row-table.component.depr.html',
  styleUrls: ['../row/row.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormRowTableComponent extends AbstractRowComponent {

  /**
   * @deprecated
   */
  constructor(
    protected elementRef: ElementRef,
    devMode: DevModeService,
  ) {
    super(elementRef);

    if (devMode.isDevMode()) {
      // tslint:disable-next-line no-console
      console.warn('pe-form-row-table is deprectated. Please use pe-form-fieldset. This component will be removed in version 7');
    }
  }

  protected updateElementClassList(): void {
    if ( !this.htmlElement ) {
      return;
    }
    super.updateElementClassList();
    DECORATIONS.forEach(
      (decoration: FieldDecorationType) => this.htmlElement.classList.remove(`has-${decoration}`)
    );
    if ( this.decoratorClassName ) {
      this.htmlElement.classList.add(this.decoratorClassName);
    }
  }
}
