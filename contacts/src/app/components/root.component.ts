import { Component, OnInit } from '@angular/core';

import { ContactsHeaderService } from '../modules/contacts/src/services/contacts-header.service';

@Component({
  selector: 'contacts-app',
  templateUrl: 'root.component.html',
  styleUrls: ['root.component.scss'],
})
export class RootComponent implements OnInit {

  constructor(
    private contactsHeaderService: ContactsHeaderService,
  ) {
  }

  ngOnInit(): void {
    this.contactsHeaderService.init();
  }
}
