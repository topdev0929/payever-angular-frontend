import { ChangeDetectorRef, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { filter, finalize, first, map, pluck, skip, switchMap, takeUntil, tap } from 'rxjs/operators';
import { forEach } from 'lodash';
import { MatMenuTrigger } from '@angular/material/menu';
import { BehaviorSubject, EMPTY, forkJoin, Observable } from 'rxjs';
import { HttpEventType } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { PeOverlayRef, PE_OVERLAY_DATA, PE_OVERLAY_SAVE } from '@pe/overlay-widget';

import { ContactsGQLService, ContactsStoreService, FieldsGQLService } from '../../services';
import {
  AddContact,
  AddContactField,
  AddressInterface,
  Contact,
  ContactCustomField,
  ContactField,
  ContactTypesEnum,
  Field,
  FieldGroup,
  FieldType,
  StatusField,
} from '../../interfaces';
import { getContactFields, parseJSON } from '../../utils/contacts';
import { AbstractComponent } from '../../misc/abstract.component';
import { FieldGroupGqlService } from '../../services/field-group-gql.service';
import { GroupContactsGQLService } from '../../services/group-contacts-gql.service';
import { UploaderService } from '../../services/uploader.service';
import { ValidationErrorsMapperService } from '../../services/validation-errors-mapper.service';

import { countries, Country } from 'countries-list';

@Component({
  selector: 'contacts-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent extends AbstractComponent implements OnInit {
  readonly fieldTypes: typeof FieldType = FieldType;

  @ViewChild('fileInput') fileInput: ElementRef;
  @ViewChild('customFieldsMenuTrigger', { read: MatMenuTrigger }) customFieldsMenuTrigger: MatMenuTrigger;

  isLoading = false;
  isLoadingImage = false;
  isLoadingStatuses = false;
  isGeneralPanelExpanded = true;
  isAdditionalPanelExpanded = true;
  uploadProgress: number = 0;
  contact: any = this.overlayData.contactData;
  countries: Country[] = Object.keys(countries).map(key => countries[key]);
  typeOptions = Object.entries(ContactTypesEnum).map(([name, value]) => ({ value, name: name.toLowerCase() }));
  defaultTypeOptions = this.typeOptions[0].name;
  defaultCountry = this.countries[0].name;
  readonly contactTypes = ContactTypesEnum;

  form: FormGroup  = new FormGroup({
    email: new FormControl('', [Validators.email, Validators.required]),
    businessId: new FormControl(''),
    imageUrl: new FormControl(),

    type: new FormControl(this.defaultTypeOptions, [Validators.required]),
    company: new FormControl(''),
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    mobilePhone: new FormControl('', [Validators.pattern(/^\+[1-9]{1}[0-9]{3,14}$/)]),
    homepage: new FormControl(),
    street: new FormControl(),
    city: new FormControl(),
    state: new FormControl(),
    zip: new FormControl(),
    country: new FormControl(this.defaultCountry),
    status: new FormControl(),

    customFields: new FormArray([]),
    fieldGroups: new FormArray([]),
  });

  businessFields: Field[] = [];
  statusFields: StatusField[] = [];
  fieldGroups: FieldGroup[] = [];

  private defaultFields: any[] = [
    {
      _id: 'd9aab937-ad45-4815-9a4b-63f39ec12b53',
      name: 'firstName',
      type: 'text',
    },
    {
      _id: 'aea7b2c2-3551-4c13-9ec3-a3b663bd8696',
      name: 'lastName',
      type: 'text',
    },
    {
      _id: '4f0883c5-782c-4aee-bc78-aa816b0a147c',
      name: 'email',
      type: 'text',
    },
    {
      _id: '31d87f2f-92ff-4fc5-9aa8-2a3b0bd01d94',
      name: 'imageUrl',
      type: 'text',
    },
    {
      _id: 'f74d86a1-baba-49ab-9e6d-b54b443eec5a',
      name: 'mobilePhone',
      type: 'text',
    },
    {
      _id: '01ddf78e-b5f8-4cee-89ac-eea8b3b5415b',
      name: 'homepage',
      type: 'text',
    },
    {
      _id: '43b2e39b-b4a8-4a4a-8e17-6908aa9e7ce8',
      name: 'street',
      type: 'text',
    },
    {
      _id: 'abb9689c-2d5d-4cba-bbd5-4a50fd93057d',
      name: 'city',
      type: 'text',
    },
    {
      _id: '61b97dea-04a8-4b57-ba05-14cef537ec5a',
      name: 'state',
      type: 'text',
    },
    {
      _id: '5c4ac4a3-683a-49aa-bf8c-6795cfee8a5a',
      name: 'zip',
      type: 'text',
    },
    {
      _id: '57f155d8-c343-48b2-b4a4-0011177b5d06',
      name: 'country',
      type: 'text',
    },
  ];

  constructor(
    private fb: FormBuilder,
    private contactsGQLService: ContactsGQLService,
    private fieldsGQLService: FieldsGQLService,
    private route: ActivatedRoute,
    private router: Router,
    private fieldGroupGqlService: FieldGroupGqlService,
    private contactsStoreService: ContactsStoreService,
    private groupContactsGQLService: GroupContactsGQLService,
    private uploaderService: UploaderService,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private peOverlayRef: PeOverlayRef,
    private errorsMessagesService: ValidationErrorsMapperService,
    @Inject(PE_OVERLAY_DATA) public overlayData: any,
    @Inject(PE_OVERLAY_SAVE) public overlaySaveSubject: BehaviorSubject<any>,
  ) {
    super();
  }

  ngOnInit(): void {
    this.form.markAllAsTouched();
    if (this.contact) {
      this.loadAllContactData();
    }

    this.overlaySaveSubject.pipe(skip(1)).subscribe((dialogRef: any) => {
      if (dialogRef) {
        this.onSubmit();
      }
    });
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  loadAllContactData(): void {
    this.isLoading = true;
    this.isLoadingStatuses = true;
    forkJoin([
      this.fieldsGQLService.getStatusesFields().pipe(
        tap(statusFields => this.statusFields = statusFields),
        finalize(() => this.isLoadingStatuses = false),
      ),
      // Get custom fields array related to business
      this.fieldsGQLService.getFields().pipe(
        tap((fields: Field[]) => {
          this.businessFields = fields;
        }),
      ),
      this.fieldsGQLService.getDefaultField().pipe(
        tap((fields: Field[]) => {
          // this.defaultFields = fields;
        }),
      ),
    ]).pipe(
      switchMap(([statusFields, businessFields, defaultFields]: [StatusField[], Field[], Field[]]) => {
        return this.fieldGroupGqlService.getFieldGroups(this.contact?.businessId).pipe(
          tap(fieldGroups => this.fieldGroups = fieldGroups),
          map(fieldGroups => ([statusFields, businessFields, fieldGroups, defaultFields])),
        );
      }),
      tap(([statusFields, businessFields, fieldGroups]: [StatusField[], Field[], FieldGroup[], Field[]]) => {
        let fields: { [key: string]: string };
        const fieldsDict = {};
        if (this.contact) {
          this.contactsStoreService.contactId = this.contact.id;
          fields = getContactFields(this.contact);
          fields.type = this.contact.type;
          fields.businessId = this.contact.businessId;
          // Set customFields in forms from BE
          this.contact.fields.forEach((field: { fieldId: string | number; }) => {
            fieldsDict[field.fieldId] = field;
          });
          const additionalFields: ContactCustomField[] = this.getAdditionalFields(this.contact.fields);
          additionalFields.forEach((field: ContactCustomField) => {
            const group: FormGroup = this.patchValues(field);
            (this.form.controls.customFields as FormArray).push(group);
          });
        }
        const data: Contact = this.contactsStoreService.getContactData();
        if (data) {
          if (data.status && !this.statusFields.some(statusField => statusField.id === data.status.id)) {
            delete data['status'];
          }
          if (data.fieldGroups?.length) {
            const fieldGroupFieldsDict: { [id: string]: Field[] } = businessFields.reduce(
              (acc, businessField) => {
                if (acc[businessField.groupId]) {
                  acc[businessField.groupId].push(businessField);
                } else {
                  acc[businessField.groupId] = [businessField];
                }
                return acc;
              },
              {},
            );
            data.fieldGroups.forEach((fieldGroup: any) => {
              (this.form.get('fieldGroups') as FormArray).push(this.fb.group({
                id: fieldGroup.id,
                name: fieldGroup.name,
              }));
              if (fieldGroupFieldsDict[fieldGroup.id]) {
                fieldGroupFieldsDict[fieldGroup.id].forEach((businessField: any) => {
                  if (!fieldsDict[businessField.id]) {
                    (this.form.get('customFields') as FormArray).push(this.getCustomFieldFormGroup(businessField));
                  }
                });
              }
            });
          }
        }
        this.form.patchValue({
          ...fields,
          ...data,
        });
      }),
      takeUntil(this.destroyed$),
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }),
    ).subscribe();

  }

  addStatus(e: Event): void {
    e.stopPropagation();
    this.contactsStoreService.saveContactData(this.form.value);
  }

  setStatus(status: StatusField): void {
    this.form.get('status').patchValue(status);
  }

  onSubmit(): void {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      Object.keys(this.form.controls).forEach(key => {
        this.form.controls[key].markAsDirty();
      });
      this.cdr.detectChanges();

      return;
    }

    if (this.form.valid) {
      const request$ = this.contact ? this.updateContact() : this.createContact();
      request$.pipe(
        switchMap(() => {
          if (!this.contactsStoreService.group) {
            return EMPTY;
          }
          return this.groupContactsGQLService.createGroupContact({
            id: '',
            contactId: this.contact.id,
            groupId: this.contactsStoreService.group.id,
          });
        }),
        takeUntil(this.destroyed$),
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
          this.peOverlayRef.close(true);
        })
      ).subscribe();
    }
  }

  getCustomFields(): FormArray {
    return this.form.get('customFields') as FormArray;
  }

  selectOption(option: FieldGroup): void {
    // Get custom fields of Option
    this.contactsStoreService.field = option;
    this.contactsStoreService.contactId = this.contact?.id;
    this.contactsStoreService.saveContactData(this.form.value);
  }

  addNewField(field?: AbstractControl): void {
    this.contactsStoreService.saveContactData(this.form.value);
    this.contactsStoreService.contactId = this.contact?.id;
    this.contactsStoreService.customFormFieldGroup = field as FormGroup;
  }

  openCustomFieldsMenu(): void {
    if (!this.fieldGroups.length) {
      return;
    }
    this.customFieldsMenuTrigger.openMenu();
  }

  addMedia($event: any): void {
    const files: FileList = $event.target.files as FileList;
    if (files.length > 0) {
      this.isLoadingImage = true;
      const file: File = files[0];
      const reader: FileReader = new FileReader();
      reader.readAsDataURL(file);
      this.fileInput.nativeElement.value = '';

      reader.onload = () => {
        this.uploaderService.uploadImageWithProgress('images', file, false).pipe(
          takeUntil(this.destroyed$),
        ).subscribe((event: any) => {
          switch (event.type) {
            case HttpEventType.UploadProgress: {
              this.uploadProgress = event.loaded;
              this.cdr.detectChanges();
              break;
            }
            case HttpEventType.Response: {
              this.form.patchValue({ imageUrl: event.body.blobName || reader.result as string });
              this.isLoadingImage = false;
              this.cdr.detectChanges();
              break;
            }
            default:
              break;
          }
        });
      };
    }
  }

  deleteField(field: ContactCustomField): void {
    const id = field.id;
    const index: number = (this.form.controls.customFields.value as ContactCustomField[]).findIndex(customFiled => customFiled.id === id);
    if (index > -1) {
      (this.form.controls.customFields as FormArray).removeAt(index);
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  private getContactFields(): AddContactField[] {
    const fields = [];
    this.defaultFields.forEach((field: any) => {
      const control = this.form.get(field.name);
      if (control?.value) {
        if (field.name === 'company') {
          if (this.form.get('type').value === ContactTypesEnum.Company) {
            fields.push({ value: control.value, fieldId: field.id });
          }
        } else {
          fields.push({ value: control.value, fieldId: field._id });
        }
      }
    });
    const customFields = this.form.get('customFields').value;
    customFields.forEach((customField: any) => {
      if (customField.fieldValue) {
        fields.push({
          value: customField.fieldType === FieldType.Multiselect ?
            JSON.stringify(customField.fieldValue).replace(/"/g, '\\"') : customField.fieldValue,
          fieldId: customField.id,
        });
      }
    });
    return fields;
  }

  private updateContact(): Observable<any> {
    this.isLoading = true;
    let mainRequest$: Observable<any>;
    mainRequest$ = this.contactsGQLService.updateContact(this.contact._id, {
      type: this.form.value.type,
      fields: this.getContactFields(),
    });
    return mainRequest$.pipe(
      first(),
    );
  }

  private createContact(): Observable<any> {
    const contact: AddContact = {
      type: this.form.value.type,
      fields: this.getContactFields(),
    };
    this.isLoading = true;
    return this.contactsGQLService.addContact(contact)
      .pipe(
        first(),
      );
  }

  private getCustomFieldFormGroup(businessField: Field): FormGroup {
    let showOnPerson = false, showOnCompany = false;
    businessField.showOn?.forEach((value: ContactTypesEnum) => {
      switch (value) {
        case ContactTypesEnum.Company:
          showOnCompany = true;
          break;
        case ContactTypesEnum.Person:
          showOnPerson = true;
          break;
        default:
          break;
      }
    });
    return this.fb.group({
      showOnPerson,
      showOnCompany,
      id: [businessField.id],
      fieldLabel: [businessField.name],
      fieldType: [businessField.type],
      fieldValue: [],
      defaultValues: [businessField.defaultValues ?? []],
      filterable: [businessField.filterable],
      editableByAdmin: [businessField.editableByAdmin],
    });
  }

  private patchValues(field: ContactCustomField): FormGroup {
    const group: FormGroup = this.fb.group({});
    forEach(field, (value, key) => {
      group.addControl(key, new FormControl(value));
    });
    return group;
  }

  private getAdditionalFields(contactFields: ContactField[]): ContactCustomField[] {
    const contactCustomFields: ContactCustomField[] = [];
    contactFields?.forEach((contactField: ContactField) => {
      if (!this.defaultFields.find((defField: Field) => defField.id === contactField.field.id)) {
        let showOnPerson = false, showOnCompany = false;
        if (contactField?.field?.showOn) {
          contactField.field.showOn.forEach((value: ContactTypesEnum) => {
            if (value === ContactTypesEnum.Person) {
              showOnPerson = true;
            } else if (value === ContactTypesEnum.Company) {
              showOnCompany = true;
            }
          });
        }
        contactCustomFields.push({
          showOnCompany,
          showOnPerson,
          id: contactField.fieldId,
          fieldLabel: contactField.field.name,
          fieldType: contactField.field.type,
          fieldValue: contactField.field.type === FieldType.Multiselect ?
            parseJSON(contactField.value) : contactField.value,
          defaultValues: contactField.field.defaultValues,
          filterable: contactField.field.filterable,
          editableByAdmin: contactField.field.editableByAdmin,
        });
      }
    });
    return contactCustomFields;
  }

  addressOn(address: AddressInterface): void {
    this.form.patchValue({
      street: address.street,
      city: address.city,
      zip: address.zip_code,
      country: countries[address.country]?.name,
    });
  }

  visitHomepage(): void {
    const homepage = this.form.get('homepage').value;
    if (homepage) {
      window.open(homepage, '_blank');
    }
  }

  getFieldValidity(fieldName: string): boolean {
    const field = this.form.get(fieldName);

    return field.dirty && field.invalid;
  }

  getFieldErrorText(field: string): string {
    const fieldErrors: ValidationErrors = this.form.get(field).errors || {};
    const flattenErrors: ValidationErrors = {};
    const patternError = fieldErrors.pattern;

    Object.entries(fieldErrors || {})
      .filter(([, errorValue]) => typeof errorValue === 'boolean')
      .forEach(([errorName, errorValue]) => flattenErrors[errorName] = errorValue);

    if (patternError) {
      flattenErrors[patternError.requiredPattern] = true;
    }

    const allMessages = this.errorsMessagesService.getAllErrorMessages(flattenErrors);

    return allMessages[0] || '';
  }
}
