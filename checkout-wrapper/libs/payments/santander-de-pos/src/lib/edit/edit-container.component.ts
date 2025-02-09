import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';

import {
  BaseEditContainerComponent,
} from '@pe/checkout/santander-de-pos/shared';
import { ClearFormState } from '@pe/checkout/store';


@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'santander-de-pos-edit-container',
  templateUrl: './edit-container.component.html',
  styles: [`
    :host { display: block; }
  `],
})
export class EditContainerComponent extends BaseEditContainerComponent implements OnInit, OnDestroy {
  @Input() darkMode = false;

  @Output() continue = new EventEmitter();

  ngOnDestroy(): void {
    this.store.dispatch(new ClearFormState());
  }

  ngOnInit(): void {
    super.ngOnInit();
  }
}
