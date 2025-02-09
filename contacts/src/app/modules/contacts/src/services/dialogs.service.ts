import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';

import { PeOverlayConfig, PeOverlayRef, PeOverlayWidgetService } from '@pe/overlay-widget';
import { PeDataGridTheme } from '@pe/common';

import { ContactComponent } from '../components/contact/contact.component';
import { ContactResponse } from '../interfaces';
import { ContactsWidgetComponent } from '../components/contacts-widget/contacts-widget.component';

@Injectable()
export class DialogsService {

  dialogRef: PeOverlayRef;
  onSaveSubject$ = new BehaviorSubject<any>(null);
  readonly onSave$ = this.onSaveSubject$.asObservable();
  successSubject$ = new BehaviorSubject<any>(null);
  readonly onSuccess$ = this.successSubject$.asObservable();

  get theme(): PeDataGridTheme {
    return PeDataGridTheme.Dark;
  }

  constructor(
    protected overlayService: PeOverlayWidgetService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
  }

  openContactDialog(contactData?: ContactResponse): void {
    const config: PeOverlayConfig = {
      data: {
        contactData
      },
      hasBackdrop: true,
      headerConfig: {
        title: contactData ? 'Edit contact' : 'New contact',
        backBtnTitle: 'Cancel',
        backBtnCallback: () => {
          this.confirmClose();
        },
        doneBtnTitle: 'Save',
        doneBtnCallback: () => {
          this.onSaveSubject$.next(this.dialogRef);
        },
        theme: this.theme,
        removeContentPadding: true,
        onSaveSubject$: this.onSaveSubject$,
        onSave$: this.onSave$,
      },
      backdropClick: () => {
        this.confirmClose();
      },
      component: ContactComponent,
    };

    this.dialogRef = this.overlayService.open(config);
    this.dialogRef.afterClosed
      .pipe(
        tap((saved: boolean) => {
          if (saved) {
            this.successSubject$.next(saved);
          }
        }),
      )
      .subscribe();
  }

  confirmClose(): void {
    const queryParams = {};
    queryParams['closeDialog'] = true;
    this.router.navigate([], { queryParams, relativeTo: this.route });
  }

  openContactsWidgetDialog(id: string, contactName: string): void {
    const config: PeOverlayConfig = {
      data: {
        contactId: id
      },
      hasBackdrop: true,
      headerConfig: {
        title: contactName,
        backBtnTitle: 'Cancel',
        backBtnCallback: () => {
          this.confirmClose();
        },
        doneBtnTitle: 'Done',
        doneBtnCallback: () => {
          this.overlayService.close();
        },
        theme: this.theme,
        removeContentPadding: true
      },
      backdropClick: () => {
        this.confirmClose();
      },
      component: ContactsWidgetComponent,
    };

    this.dialogRef = this.overlayService.open(config);

    this.dialogRef.afterClosed.subscribe((contactData: any) => {
      if (contactData) {
        this.openContactDialog(contactData);
      }
    });
  }
}
