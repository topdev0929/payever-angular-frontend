import { ChangeDetectionStrategy, Component, ElementRef } from '@angular/core';

import { AbstractRowComponent } from '../abstract-row';
import { DevModeService } from '../../../dev';

/**
 * @deprecated Should be removed after migration to fieldset
 */
@Component({
  selector: 'pe-form-row-default',
  templateUrl: 'row-default.component.depr.html',
  styleUrls: ['../row/row.component.scss'],
  host: {
    '[class.pe-form-row-default]': 'true'
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormRowDefaultComponent extends AbstractRowComponent {

  /**
   * @deprecated
   */
  constructor(
    protected elementRef: ElementRef,
    protected devMode: DevModeService,
  ) {
    super(elementRef);

    if (devMode.isDevMode()) {
      console.warn('pe-form-row-default is deprectated. Please use pe-form-fieldset. This component will be removed in version 7');
    }
  }

  get hasAddon(): boolean {
    return Boolean(this.addonPrepend) || Boolean(this.addonAppend);
  }

  get formWidgetClassName(): string {
    const className: string[] = this.properties.formWidgetClassName ?
      this.properties.formWidgetClassName.split(' ') :
      [];
    if ( this.properties.label ) { // TODO Remove
      className.push('labeled');
    }
    if ( this.hasAddon ) {
      className.push('input-group');
    }
    return className.join(' ');
  }

  protected setElementClassList(): void {
    if (!this.htmlElement) {
      return;
    }
    this.htmlElement.classList.add('form-group');
    super.setElementClassList();
  }
}
