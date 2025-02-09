import {
  Component,
  Inject,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';

import { PeOverlayRef, PE_OVERLAY_DATA } from '@pe/overlay-widget';

import { AbstractComponent } from '../../../shared/abstract';


@Component({
  selector: 'peb-browse-contacts',
  templateUrl: './browse-contacts.component.html',
  styleUrls: ['./browse-contacts.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PeBrowseContactsFormComponent extends AbstractComponent implements OnInit, OnDestroy {
  selectedItems = [];

  constructor(
    @Inject(PE_OVERLAY_DATA) public overlayData: any,
    private peOverlayRef: PeOverlayRef,
  ){
    super();
  }
  ngOnInit(): void {
  }

  closeContactDialog() {
    this.peOverlayRef.close(null);
  }

  addContactDialog() {
    this.peOverlayRef.close(this.selectedItems);
  }
  onSelectedItemChanged(e) {
    this.selectedItems = e;
  }
}
