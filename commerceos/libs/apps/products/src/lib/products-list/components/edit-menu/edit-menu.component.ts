import { ChangeDetectionStrategy, Component } from '@angular/core';

import { MessageBus, EnvService } from '@pe/common';

@Component({
  selector: 'pf-edit-menu',
  templateUrl: 'edit-menu.component.html',
  styleUrls: ['./edit-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditMenuComponent {

  item: any;

  constructor(
    private messageBus: MessageBus,
    private envService: EnvService,
  ) {
  }

  edit() {
    this.messageBus.emit('products.edit.menu', this.item);
  }

  delete() {
    this.messageBus.emit('products.delete.menu', this.item);
  }

}
