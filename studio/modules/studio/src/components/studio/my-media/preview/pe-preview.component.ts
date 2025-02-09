import { ChangeDetectorRef, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, } from '@angular/forms';
import { MatMenuTrigger } from '@angular/material/menu';
import { Store } from '@ngxs/store';
import { EnvService } from '@pe/common';
import { OverlayHeaderConfig, PeOverlayWidgetService, PE_OVERLAY_CONFIG, PE_OVERLAY_DATA } from '@pe/overlay-widget';
import { BehaviorSubject, of } from 'rxjs';
import { switchMap, takeUntil, tap } from 'rxjs/operators';
import { AbstractComponent, StudioEnvService } from '../../../../core';

import { StudioApiService } from '../../../../core/services/studio-api.service';
import { EditGridItem } from '../../../../core/store/items.actions';
import { PeAddFieldComponent } from './add-field/add-fields.component';

enum FieldTypes {
  Input = 'single_line_text'
}

@Component({
  selector: 'pe-preview',
  templateUrl: './pe-preview.component.html',
  styleUrls: ['./pe-preview.component.scss'],
  providers: [FormBuilder, PeOverlayWidgetService]
})
export class PePreviewComponent extends AbstractComponent implements OnInit {
  fieldTypes = FieldTypes;
  form: FormGroup;
  uploaded: false;
  theme: string;
  fieldGroup;
  fieldGroups = [];
  customFields = new FormArray([]);
  saveSubject$ = new BehaviorSubject(null);

  @ViewChild('clickHoverMenuTrigger') customFieldsMenuTrigger: MatMenuTrigger;

  constructor(private fb: FormBuilder,
              private peMediaService: StudioApiService,
              @Inject(PE_OVERLAY_DATA) public appData: any,
              @Inject(PE_OVERLAY_CONFIG) public config: OverlayHeaderConfig,
              private overlay: PeOverlayWidgetService,
              private store: Store,
              @Inject(EnvService) private envService: StudioEnvService,
              private cdr: ChangeDetectorRef
  ) {
    super();
    this.config.doneBtnCallback = () => this.saveDetail();
  }

  ngOnInit(): void {

    this.theme = this.appData.theme;
    this.form = this.fb.group({
      customFields: this.fb.array([]),
      name: [],
      createdAt: [],
      mediaType: [],
      updatedAt: [],
      url: [],
      _id: [],
      business: [],
      mediaInfo: this.fb.group({
        dimension: [],
        size: [],
        type: [],
      }),
      price: [],
      license: [],
      dimension: [],
      location: [],
      duration: [],
      owner: [],
    });

    this.form.patchValue(this.appData);
    this.cdr.detectChanges();
    this.cdr.markForCheck();

    this.peMediaService.getUserAttributeGroups(this.envService.businessId).pipe(
      switchMap(groups => {
        const mediaAdditionalFields = groups.find(group => group.name === 'mediaAdditionalFields');
        return mediaAdditionalFields ? of(mediaAdditionalFields) :
          this.peMediaService.createUserAttributeGroup(this.envService.businessId,
            { name: 'mediaAdditionalFields', businessId: this.envService.businessId });
      }),
      switchMap(fieldGroup => {
        this.fieldGroup = fieldGroup;
        return this.peMediaService.getUserAttributeByGroup(this.envService.businessId, fieldGroup._id);
      }),
      tap(fields => this.fieldGroups = fields)
    ).subscribe(_ => this.createItem());

    this.saveSubject$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      if (data) {
        this.fieldGroups.push(data);
        this.selectOption(data);
        this.cdr.detectChanges();
      }
    });
  }
  get formDate(): string {
    return this.form.get('createdAt').value;
  }
  get formUpdatedDate(): string {
    return this.form.get('updatedAt').value;
  }
  get formOpenByMeDate(): any {
    return Date.now();
  }

  downloadImage(): void {
    this.peMediaService.downloadMedia(this.appData.url);
  }

  closeDialog(): void {
    this.overlay.close();
  }


  openAddFieldDialog(): void {
    this.overlay.open({
      component: PeAddFieldComponent,
      hasBackdrop: true,
      data: { theme: this.theme, businessId: this.envService.businessId, groupId: this.fieldGroup._id },
      backdropClass: 'settings-backdrop',
      panelClass: 'studio-widget-panel',
      headerConfig: {
        theme: 'dark',
        onSaveSubject$: this.saveSubject$,
        backBtnTitle: 'Cancel',
        backBtnCallback: () => this.overlay.close(),
        doneBtnTitle: 'Save',
        title: 'Add field',
      }
    });
  }


  openCustomFieldsMenu(e): void {
    e.stopPropagation();
    if (!this.fieldGroups.length) {
      return;
    }
    this.customFieldsMenuTrigger.openMenu();
  }


  selectOption(option): void {
    this.customFields = this.form.get('customFields') as FormArray;
    this.customFields.push(this.fb.group({
      type: option.type,
      label: option.name,
      id: option._id,
      value: ''

    }));
  }

  createItem(): void {
    this.customFields = this.form.get('customFields') as FormArray;
    this.appData.userAttributes.forEach(attr => {
      this.customFields.push(this.fb.group({
        type: attr.attribute.type,
        label: attr.attribute.name,
        id: attr.attribute._id,
        value: attr.value

      }));
    });
  }

  saveDetail(): void {
    const userAttributes = [];
    this.form.get('customFields').value.forEach(attr => {
      userAttributes.push({
        attribute: attr.id,
        value: attr.value
      });
    });
    this.peMediaService.updateMedia(this.envService.businessId, {
      businessId: this.envService.businessId,
      mediaType: this.appData.mediaType,
      url: this.appData.url,
      userAttributes
    }, this.appData._id).subscribe(data => {
      this.store.dispatch(new EditGridItem(data));
      this.config.onSaveSubject$.next('saved');
    });

  }

  removeItem(i): void{
    this.customFields = this.form.get('customFields') as FormArray;
    this.customFields.removeAt(i);
  }

}
