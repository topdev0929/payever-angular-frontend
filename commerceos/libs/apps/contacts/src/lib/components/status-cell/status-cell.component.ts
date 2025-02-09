import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { filter, finalize, map, takeUntil, tap } from 'rxjs/operators';

import { AppType, PeDestroyService } from '@pe/common';
import { PeGridItem, PeGridItemsActions } from '@pe/grid';
import { ContactsAppState, StatusField } from '@pe/shared/contacts';

import { ContactMainInfo, ContactsGQLService, ContactsListService, getContactDisplayFields } from '../../public-api';

const APP_NAME = AppType.Contacts;

@Component({
  selector: 'pe-status-cell',
  templateUrl: './status-cell.component.html',
  styleUrls: ['./status-cell.component.scss'],
})
export class StatusCellComponent implements OnInit {
  @Input() item: PeGridItem;

  @Select(ContactsAppState.statues) statusFields$: Observable<StatusField[]>;

  formGroup: FormGroup;
  loading$ = new Subject<boolean>();

  constructor(
    private store: Store,
    private destroy$: PeDestroyService,
    private contactsGQLService: ContactsGQLService,
    private contactsListService: ContactsListService,
  ) {}

  ngOnInit() {
    this.formGroup = new FormGroup({
      status: new FormControl(this.item.data?.status),
    });

    this.formGroup.get('status').valueChanges.pipe(
      filter(value => value !== this.item.data?.status),
      tap((newStatus) => {
        const contactId = this.item.id;
        this.loading$.next(true);
        this.contactsGQLService.updateContactStatus(contactId, newStatus).pipe(
          tap((contactData) => {
            const contactItem: ContactMainInfo = getContactDisplayFields(contactData);
            const gridItem = this.contactsListService.contactsToGridItemMapper([contactItem])[0];

            this.store.dispatch(new PeGridItemsActions.EditItem(gridItem, APP_NAME));
          }),
          finalize(() => {
            this.loading$.next(false);
          }),
        ).subscribe();
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  getStatus$(): Observable<StatusField> {
    return this.statusFields$.pipe(
      map((statusFields: StatusField[]) => statusFields.find(
        (status: StatusField) => status.id === this.item.data?.status)
      ),
    );
  }

  getStatusFieldsWithIcon$() {
    return this.statusFields$.pipe(
      map((statusFields: StatusField[]) => statusFields.map(status => ({
          ...status,
          icon: {
            id: '#icon-n-indicator-64',
            color: status.color,
          },
        })
      )),
    );
  }
}
