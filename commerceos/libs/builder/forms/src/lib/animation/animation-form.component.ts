import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { Observable, Subject, merge } from 'rxjs';
import {
  catchError,
  filter,
  map,
  shareReplay,
  startWith,
  switchMap,
  take,
  takeUntil,
  tap,
  withLatestFrom,
} from 'rxjs/operators';

import {
  PebAnimationBindingType,
  PebViewElementEventType,
  PebRenderContainer,
  PebUnit,
  PebAnimationKeyframeMapper,
  PebAPIDataSourceSchema,
  PebAnimationTriggerSetting,
} from '@pe/builder/core';
import { toCamelCase } from '@pe/builder/editor-utils';
import { PebElement } from '@pe/builder/render-utils';
import { PebSideBarService } from '@pe/builder/services';
import { PebElementsState } from '@pe/builder/state';
import { PebViewAnimationPreviewAction } from '@pe/builder/view-actions';
import { PeDestroyService } from '@pe/common';

import { PebColorForm } from '../color';
import { flattenIntegrationTree } from '../form.utils';
import {
  IntegrationNodeType,
  PebContextFieldTree,
  PebIntegrationFormService,
  PebIntegrationTreeItem,
} from '../integrations';
import { PebFieldSelectorComponent } from '../integrations/field-selector/field-selector.component';
import { PebIntegrationListComponent } from '../integrations/integration-list/integration-list.component';
import { PebSchemaResolverService } from '../integrations/services/schema-resolver.service';
import { interactionTriggers } from '../interactions/constants';

import { PebAnimationsFormService } from './animations-form.service';
import * as constants from './constants';
import { FormModel } from './models';


@Component({
  selector: 'peb-animation-form',
  templateUrl: './animation-form.component.html',
  styleUrls: [
    '../../../../styles/src/lib/styles/_sidebars.scss',
    './animation-form.component.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    PeDestroyService,
  ],
})
export class PebAnimationFormComponent implements OnDestroy {
  @Select(PebElementsState.selected) private readonly selectedElements$!: Observable<PebElement[]>;

  fillModes = constants.fillModes;
  triggers = interactionTriggers;
  timings = constants.timings;
  scrollBindingTargets = constants.scrollBindingTargets;
  properties = Object.entries(constants.propertiesMap).map(([key, value]) => ({ value: key, ...value }));
  propertiesMap =constants.propertiesMap;
  keyframeMapperProviders = constants.keyframeMapperProviders;
  animationBindingTypes = constants.animationBindingTypes;

  sourceElements$ = this.animationsFormService.sourceElements$;
  contentElements$ = this.animationsFormService.contentElements$;

  renderContainer: PebRenderContainer = { key: 'editor', editMode: true, renderScripts: false };

  form = this.animationsFormService.editForm;
  formValue$ = this.form.valueChanges.pipe(startWith(this.form.value));

  isScrollBinding$ = this.form.valueChanges.pipe(
    startWith(this.form.getRawValue()),
    map(value => value.trigger === PebViewElementEventType.PageScroll),    
    shareReplay(1),
  );

  formChanged$ = this.form.valueChanges.pipe(
    filter(() => this.form.dirty),
    tap((value) => {
      this.animationsFormService.submitAnimationForm();
      this.form.markAsPristine();
    }),
  );

  formOptions$ = this.formValue$.pipe(
    map(form => this.getFormOptions(form)),
  );


  selectedDataSource$ = this.integrationFormService.getAllConnectorsDataSources$().pipe(
    map(children => Object.values(flattenIntegrationTree({ id: '', children } as any))),
    tap((dataSources: PebIntegrationTreeItem[]) => this.dataSources = dataSources),
    switchMap((dataSources: PebIntegrationTreeItem[]) => this.formValue$.pipe(
      map((value: FormModel) => {
        const uniqueTag = value.triggerSetting?.contextTag ?? '';

        return dataSources.find(item => (item.value as PebAPIDataSourceSchema)?.uniqueTag === uniqueTag);
      }),
    )),
  );

  contextTitle$ = this.selectedDataSource$.pipe(
    withLatestFrom(this.formValue$),
    map(([dataSource, formValue]) => dataSource?.title ?? formValue?.triggerSetting?.contextTag),
    shareReplay(1),
  );

  contextFieldTitle$ = this.formValue$.pipe(
    map((form: FormModel) => {
      const fields = form.triggerSetting?.contextField?.split('.');
      if (fields[0] === 'value') {
        fields.splice(0, 1);
      }

      return fields.map(s => toCamelCase(s)).join('.');
    }),
  );

  dataSources: PebIntegrationTreeItem[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private readonly store: Store,
    private readonly sidebarService: PebSideBarService,
    private readonly animationsFormService: PebAnimationsFormService,
    private readonly integrationFormService: PebIntegrationFormService,
    private schemaResolverService: PebSchemaResolverService,
  ) {
    merge(this.formChanged$).pipe(
      takeUntil(this.destroy$),
      catchError((err, caught) => {
        console.error(err);

        return caught;
      }),
    ).subscribe();
  }

  ngOnDestroy() {
    this.destroy$.next();
  }

  addKeyframe() {
    const raw: FormModel = this.form?.getRawValue();
    const lastKeyframe = raw?.keyframes?.pop();
    const properties = lastKeyframe?.properties || [];
    const offset = { unit: PebUnit.Percent, value: lastKeyframe ? 100 : 0 };
    const formGroup = this.animationsFormService.getKeyframeFormGroup({ offset, properties });
    this.keyframesControl.push(formGroup);
    this.animationsFormService.submitAnimationForm();
  }

  removeKeyframe(keyframeIndex: number) {
    this.keyframesControl.removeAt(keyframeIndex);
    this.animationsFormService.submitAnimationForm();
  }

  getPropName(property: FormGroup) {
    return property.value.key.name;
  }

  addProperty(keyframe: FormGroup) {
    const newProperty = this.animationsFormService.suggestNewProperty();
    this.getPropertiesControl(keyframe).push(this.animationsFormService.getPropertyFormGroup(newProperty));
    this.animationsFormService.submitAnimationForm();
  }

  removeProperty(keyframeIndex: number, propertyIndex: number) {
    this.getPropertiesControl(this.keyframesControl.controls[keyframeIndex] as FormGroup).removeAt(propertyIndex);    
    this.animationsFormService.submitAnimationForm();
  }

  showColorForm(prop: FormGroup) {
    const formControl = (prop.controls.values as FormGroup).controls.color as FormControl;

    const colorForm = this.sidebarService.openDetail(
      PebColorForm,
      { backTitle: 'Style', title: this.properties.find(p => p.value === prop.value.key).name }
    );

    colorForm.instance.formControl = formControl;
  }

  previewAnimation() {
    const selectedIds = this.store.selectSnapshot(PebElementsState.selectedElementIds);
    const animation = this.animationsFormService.formToAnimation(this.form.getRawValue());

    for (const elementId of selectedIds) {
      this.store.dispatch(new PebViewAnimationPreviewAction(elementId, animation));
    }
  }

  getPropertiesControl(keyframe: FormGroup): FormArray {
    return keyframe.controls.properties as FormArray;
  }

  get keyframesControl(): FormArray {
    return this.form.controls.keyframes as FormArray;
  }

  selectContextTag(): void {
    const functionForm = this.sidebarService.openDetail(
      PebIntegrationListComponent,
      { backTitle: 'Back', title: 'Data Source' },
    );
    functionForm.instance.dataType = IntegrationNodeType.DataSource;
    functionForm.instance.selectedIntegration$.pipe(
      tap((item) => {
        if (item.type !== IntegrationNodeType.DataSource) {
          return;
        }

        const uniqueTag = (item.value as PebAPIDataSourceSchema)?.uniqueTag;
        if (!uniqueTag) {
          return;
        }

        const patch: Partial<PebAnimationTriggerSetting> = { contextTag: uniqueTag, contextField: '' };
        const form = this.form.get('triggerSetting');
        form.patchValue(patch);
        this.animationsFormService.submitAnimationForm();
        this.form.markAsDirty();
      }),
      take(1),
    ).subscribe();
  }

  selectContextField(): void {    
    const value: FormModel = this.form.value;
    const dataSource = this.dataSources.find(
      item => (item.value as PebAPIDataSourceSchema)?.uniqueTag === value.triggerSetting.contextTag
    )?.value as PebAPIDataSourceSchema;

    if (!dataSource) {
      return;
    }

    const contextSelector = this.sidebarService.openDetail(
      PebFieldSelectorComponent,
      { backTitle: 'Back', title: 'Context Field' },
    );

    contextSelector.instance.schema = this.schemaResolverService.getContextFieldsOfDataSource(dataSource);
    contextSelector.instance.selected$.pipe(
      tap((item: PebContextFieldTree) => {
        const patch: Partial<PebAnimationTriggerSetting> = { contextField: item.value };
        const form = this.form.get('triggerSetting');
        form.patchValue(patch);
        this.animationsFormService.submitAnimationForm();
        this.form.markAsDirty();
      }),
      take(1),    
    ).subscribe();
  }


  getFormOptions(form: FormModel): FormOptions {
    const trigger = form.trigger;
    const hasBindingType = constants.keyframeMapperProviders[trigger]?.length > 0;
    const isKeyframeBinding = form.triggerSetting.bindingType === PebAnimationBindingType.Keyframe;
    const mapper = form.triggerSetting?.keyframeMapper;
    const isContext = form.trigger === PebViewElementEventType.ContextData
      && [
        PebAnimationKeyframeMapper.ContextIsEqual,
        PebAnimationKeyframeMapper.ContextIsSet,
        PebAnimationKeyframeMapper.ContextArraySize,
      ].includes(mapper);

    return {
      showTriggerSetting: hasBindingType,
      showKeyframeMapper: hasBindingType && isKeyframeBinding,
      showTriggerSourceElement: hasBindingType && form.trigger !== PebViewElementEventType.ContextData,
      showTriggerEqualNumber: mapper === PebAnimationKeyframeMapper.IsNumberEqual,
      showTriggerContentElement: mapper === PebAnimationKeyframeMapper.IsContentEqual,
      showScrollBinding: form.trigger === PebViewElementEventType.PageScroll,
      showContextTag: isContext,
      showContextField: isContext,
    };
  }
}

interface FormOptions {
  showTriggerSetting?: boolean;
  showAnimationBindingType?: boolean;
  showKeyframeMapper?: boolean;
  showTriggerSourceElement?: boolean;
  showTriggerEqualNumber?: boolean;
  showTriggerContentElement?: boolean;
  showScrollBinding?: boolean;
  showContextTag?: boolean;
  showContextField?: boolean;
}
