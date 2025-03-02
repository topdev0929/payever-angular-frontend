import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { defer, EMPTY, Observable, Subject } from 'rxjs';
import { debounceTime, map, retry, shareReplay, startWith, switchMap, takeUntil, tap } from 'rxjs/operators';

import { PebContextService } from '@pe/builder/context';
import {
  PebFilterConditionType,
  PebFilterParams,
  PebRestrictType,
  SelectOption,
} from '@pe/builder/core';
import { PebEditorIntegrationsStore } from '@pe/builder/services';
import { PeDestroyService } from '@pe/common';

import { PebRestrictAccessFormInterface } from './restrict-access-form.interface';
import { PebRestrictAccessFormService } from './restrict-access-form.service';

@Component({
  selector: 'peb-restrict-access',
  templateUrl: './restrict-access.form.html',
  styleUrls: [
    '../../../../styles/src/lib/styles/_sidebars.scss',
    './restrict-access.form.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PebRestrictAccessForm implements OnInit {

  readonly PebRestrictType = PebRestrictType;

  form: FormGroup;

  readonly typeOptions: SelectOption[] = [
    { name: 'All', value: PebRestrictType.All },
    { name: 'Specific groups of customers', value: PebRestrictType.Groups },
    { name: 'Specific customers', value: PebRestrictType.Customers },
    { name: 'Password', value: PebRestrictType.Password },
  ];

  private readonly customersAutocompleteInput$ = new Subject<string>();
  readonly contacts$ = this.customersAutocompleteInput$.pipe(
    debounceTime(500),
    switchMap((input) => {
      const filter = [{
        fieldCondition: PebFilterConditionType.Or,
        value: [
          {
            field: 'field.firstName',
            fieldCondition: PebFilterConditionType.Contains,
            value: input,
          },
          {
            field: 'field.lastName',
            fieldCondition: PebFilterConditionType.Contains,
            value: input,
          },
        ],
      }];

      return this.getContacts(filter);
    }),
  );

  readonly customersOptions$: Observable<SelectOption[]> = this.contacts$.pipe(
    map(contacts => contacts.reduce((acc, contact) => {
      if (contact.customerId && (contact.firstName || contact.lastName)) {
        acc.push({
          value: contact.customerId,
          name: `${contact.firstName} ${contact.lastName}`,
          data: contact,
        });
      }

      return acc;
    }, [])),
  );

  readonly selectedCustomers$ = defer(() => {
    const initial = this.restrictAccessFormService.getPageRestrictAccess();
    const filter = [{
      field: 'field.customerId',
      fieldCondition: PebFilterConditionType.In,
      value: initial.customers,
    }];

    return initial.customers?.length ? this.getContacts(filter) : EMPTY;
  }).pipe(
    map(contacts => contacts.reduce((acc, contact) => {
      if (contact.customerId && (contact.firstName || contact.lastName)) {
        acc.push({
          value: contact.customerId,
          name: `${contact.firstName} ${contact.lastName}`,
          data: contact,
        });
      }

      return acc;
    }, [])),
    shareReplay(1),
  );

  readonly groupsAutocompleteInput$ = new Subject<string>();
  readonly folders$: Observable<any[]> = this.groupsAutocompleteInput$.pipe(
    switchMap((input) => {
      const filter = [{
        field: 'name',
        fieldCondition: PebFilterConditionType.Contains,
        value: input,
      }];

      return this.getContactFolders(filter);
    }),
    shareReplay(1),
  );

  readonly groupsOptions$: Observable<SelectOption[]> = this.folders$.pipe(
    map(folders => folders.map(folder => ({
      name: folder.name,
      value: folder._id,
      data: folder,
    }))),
  );

  readonly selectedGroups$ = defer(() => {
    const initial = this.restrictAccessFormService.getPageRestrictAccess();
    const filter = [{ field: '_id', fieldCondition: 'in', value: initial.groups }];

    return initial.groups?.length ? this.getContactFolders(filter) : EMPTY;
  }).pipe(
    map(folders => folders.map(folder => ({
      name: folder.name,
      value: folder._id,
      data: folder,
    }))),
    shareReplay(1),
  );

  constructor(
    private fb: FormBuilder,
    private destroy$: PeDestroyService,
    private integrationsStore: PebEditorIntegrationsStore,
    private contextService: PebContextService,
    private restrictAccessFormService: PebRestrictAccessFormService,
  ) { }

  ngOnInit(): void {
    let initial = this.restrictAccessFormService.getPageRestrictAccess();
    this.form = this.fb.group({
      restrict: [initial.restrict],
      type: [initial.type],
      additional: this.fb.group({}),
    });

    this.form.get('type').valueChanges.pipe(
      startWith(this.form.get('type').value),
      tap((type: PebRestrictType) => {
        initial = this.restrictAccessFormService.getPageRestrictAccess();
        switch (type) {
          case PebRestrictType.Password:
            this.form.setControl('additional', this.fb.group({
              password: this.fb.control(initial.password, { updateOn: 'blur' }),
            }));
            break;
          case PebRestrictType.Customers:
            this.form.setControl('additional', this.fb.group({
              customers: [initial.customers],
            }));
            break;
          case PebRestrictType.Groups:
            this.form.setControl('additional', this.fb.group({
              groups: [initial.groups],
            }));
            break;
          default:
            this.form.removeControl('additional');
            break;
        }
      }),
      takeUntil(this.destroy$),
      retry(),
    ).subscribe();

    this.form.valueChanges.pipe(
      switchMap((formValue) => {
        const restrictAccess: PebRestrictAccessFormInterface = {
          restrict: formValue.restrict,
          type: formValue.type,
          password: formValue?.additional?.password,
          groups: formValue?.additional?.groups,
          customers: formValue?.additional?.customers,
        };

        return this.restrictAccessFormService.setPageRestrict(restrictAccess);
      }),
      retry(),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  customersInputChange(input: string): void {
    this.customersAutocompleteInput$.next(input);
  }

  groupsInputChange(input: string): void {
    this.groupsAutocompleteInput$.next(input);
  }

  getContacts(filter: PebFilterParams): Observable<any[]> {
    return EMPTY;
  }

  getContactFolders(filter: PebFilterParams): Observable<any[]> {
    return EMPTY;
  }
}
