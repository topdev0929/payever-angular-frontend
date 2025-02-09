import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';

import { PebElement, PebPageStore, PebScreen } from '@pe/builder-core';
import { ScreensList } from '@pe/builder-editor/projects/modules/editor/src/constants';
import { NavbarSelectInterface } from '../../../../entities/navbar';

@Component({
  selector: 'pe-builder-navbar-button-visibility-menu',
  templateUrl: './navbar-button-visibility-menu.component.html',
  styleUrls: ['./navbar-button-visibility-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class NavbarButtonVisibilityMenuComponent implements OnChanges {
  @Input() pageStore: PebPageStore;

  @Input()
  uuid: string;

  @Output()
  readonly changed = new EventEmitter<NavbarSelectInterface>();

  element: PebElement;
  screensList = ScreensList;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.uuid && changes.uuid.currentValue && this.pageStore) {
      this.element = this.pageStore.findElement(changes.uuid.currentValue);

      if (!this.element.style.display) {
        this.pageStore.updateElement(changes.uuid.currentValue, {
          style: {
            display: {
              [PebScreen.Desktop]: 'block',
              [PebScreen.Tablet]: 'block',
              [PebScreen.Mobile]: 'block',
            },
          },
        });

        this.element = this.pageStore.findElement(changes.uuid.currentValue);
      }
    }
  }

  changeDisplayStatus(screen: PebScreen, visible: boolean): void {
    this.pageStore.updateElement(this.uuid, {
      style: {
        display: {
          [screen]: visible ? 'block' : 'none',
        },
      },
    });

    this.element = this.pageStore.findElement(this.uuid);
  }
}
