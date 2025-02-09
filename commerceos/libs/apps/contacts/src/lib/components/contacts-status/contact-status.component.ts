import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngxs/store';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { merge } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { EnvService, MessageBus, PeDestroyService } from '@pe/common';
import { ConfirmScreenService, Headings } from '@pe/confirmation-screen';
import { TranslateService } from '@pe/i18n-core';
import { OverlayHeaderConfig, PeOverlayWidgetService, PE_OVERLAY_CONFIG, PE_OVERLAY_DATA } from '@pe/overlay-widget';
import { AddToStatuses, ContactsAppState, DeleteFromStatuses, UpdateStatuesItem } from '@pe/shared/contacts';

import { ContactStatusAction, StatusField } from '../../interfaces';
import { StatusGQLService } from '../../services';

import { DEFAULT_COLORS } from './component-status.constant';

@Component({
  selector: 'pe-contact-status',
  templateUrl: './contact-status.component.html',
  styleUrls: ['./contact-status.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class ContactStatusComponent {
  @SelectSnapshot(ContactsAppState.statues) statuses: StatusField[];

  public isLoading = false;
  public statusForm: FormGroup;
  public colors = DEFAULT_COLORS;
  public showError = false;
  public readonly theme = this.peOverlayConfig.theme;
  public editMode = this.peOverlayData.action === ContactStatusAction.Edit;

  private deleteHeadings: Headings = {
    title: this.translateService.translate('contacts-app.actions.status.delete.title'),
    subtitle: this.translateService.translate('contacts-app.actions.status.delete.subtitle'),
    confirmBtnText: this.translateService.translate('contacts-app.actions.status.form.remove'),
    declineBtnText: this.translateService.translate('contacts-app.actions.status.form.cancel'),
  }

  constructor(
    @Inject(PE_OVERLAY_DATA) private peOverlayData: any,
    @Inject(PE_OVERLAY_CONFIG) private peOverlayConfig: OverlayHeaderConfig,
    private statusGQLService: StatusGQLService,
    private formBuilder: FormBuilder,
    private destroy$: PeDestroyService,
    private peOverlayWidgetService: PeOverlayWidgetService,
    private envService: EnvService,
    private store: Store,
    private confirmScreenService: ConfirmScreenService,
    private messageBus: MessageBus,
    private translateService: TranslateService,
    private cdr: ChangeDetectorRef,
  ) {
    this.statusForm = this.formBuilder.group({
      name: [this.peOverlayData.value?.name, Validators.required],
      color: [this.peOverlayData.value?.color ?? this.colors[0]],
    });

    merge(
      this.peOverlayData.sendSubject$.pipe(
        tap(() => this.submit()),
      ),
      this.messageBus.listen('confirm').pipe(
        tap((confirm) => {
          if (confirm) {
            this.deleteStatus();
          }
        }),
      ),
    ).pipe(
      takeUntil(this.destroy$),
    ).subscribe();
  }

  get colorsWithIcon() {
    return this.colors.map(item => ({ color: item, id: '#icon-n-indicator-64' }));
  }

  get selectedColor() {
    return this.statusForm.get('color').value;
  }

  get nameErrorMessage() {
    if (!this.showError) {
      return ''
    }
    if (this.statusForm.get('name').hasError('required')) {
      return 'contacts-app.actions.status.form.status_required'
    } else {
      return 'contacts-app.actions.status.form.status_duplicate'
    }
  }

  public submit() {
    const { name, color } = this.statusForm.value;
    this.showError = this.statusForm.invalid || this.statuses.some(status =>
      name === this.translateService.translate(status.name))
      && name !== this.peOverlayData.value?.name;

    if (!this.showError) {
      const payload = { name, color };
      const businessId = this.envService.businessId;
      if (this.editMode) {
        this.statusGQLService
          .updateContactStatus({ ...payload, id: this.peOverlayData.value.id, businessId })
          .subscribe((response) => {
            this.store.dispatch(new UpdateStatuesItem({ id: response._id, name: response.name, color: response.name }));
            this.peOverlayData.onSavedSubject$.next({ edit: true, value: response });
          });
      } else {
        this.statusGQLService
          .createContactStatus({ ...payload })
          .subscribe((response) => {
            this.store.dispatch(new AddToStatuses({ id: response._id, name: response.name }));
            this.peOverlayData.onSavedSubject$.next({ create: true, value: response });
          });
      }
      this.peOverlayWidgetService.close();
    }
    this.cdr.detectChanges();
  }

  public showConfirmDialogForDelete() {
    this.confirmScreenService.show(this.deleteHeadings, false);
  }

  deleteStatus() {
    const businessId = this.envService.businessId;
    this.statusGQLService
      .deleteContactStatus(this.peOverlayData.value.id, businessId)
      .pipe(tap((response) => {
        this.store.dispatch(new DeleteFromStatuses(this.peOverlayData.value.id));
        this.peOverlayData.onSavedSubject$.next({ delete: true, value: response });
        this.peOverlayWidgetService.close();
      })
    ).subscribe();
  }
}
