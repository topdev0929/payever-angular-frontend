import { ChangeDetectorRef, Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { isEqual } from 'lodash-es';
import { skip, skipWhile, switchMap, takeUntil, tap } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';
import { PE_OVERLAY_CONFIG, PE_OVERLAY_DATA } from '@pe/overlay-widget';

import {
  Action,
  RuleChannels,
  RuleConditions,
  RuleFields,
  RuleFolder,
  RuleOverlayData,
  ACTION_LIST,
  RuleAction,
  ActionType,
} from '../../models/rules.model';
import { RuleObservableService } from '../../services/rule-observable.service';

@Component({
  selector: 'pe-add-rule',
  templateUrl: './add-rule.component.html',
  styleUrls: ['./add-rule.component.scss'],
  providers: [PeDestroyService],
  encapsulation: ViewEncapsulation.None,
})
export class AddRuleComponent implements OnInit {
  actionList: Action[] = ACTION_LIST;
  actionPipeline: Action[] = [];
  suggestedActions: Action[] = [];
  requiredActions: Action[] = [];
  ifList: RuleFields[] = [];
  conditionList: RuleConditions[] = [];
  channelList: RuleChannels[] = [];
  folderList: RuleFolder[] = [];
  showErrors = false;
  nameError = '';

  timMask = [/\d/, /\d/, ':', /\d/, /\d/];

  dateControl = new FormControl('', {
    validators: Validators.required,
  });

  timeControl = new FormControl('', {
    validators: [Validators.required, Validators.pattern(/^(0\d|1\d|2[0-3]):[0-5]\d$/)],
    updateOn: 'change',
  });

  ruleForm: FormGroup = this.fb.group({
    name: new FormControl('', [Validators.required]),
    description: new FormControl('', [Validators.required]),
    actions: this.fb.array([]),
  });

  private ruleSnapshot = {};

  constructor(
    @Inject(PE_OVERLAY_DATA) public overlayData: RuleOverlayData,
    @Inject(PE_OVERLAY_CONFIG) public overlayConfig: any,
    private observableService: RuleObservableService,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    private destroy$: PeDestroyService,
  ) { }

  get actionsFiled(): FormArray {
    return this.ruleForm.get('actions') as FormArray;
  }

  get defaultData() {
    return this.overlayData.rule;
  }

  ngOnInit(): void {
    this.ifList = this.overlayData.fields;
    this.conditionList = this.overlayData.conditions;
    this.folderList = this.overlayData.folders;
    this.channelList = this.overlayData.channels;
    this.prepareData();
    this.saveSubscribe();
    this.handleNextActionList();
    this.cdr.detectChanges();
  }

  addAction(action: Action) {
    this.actionPipeline.push(action);
    this.addFormGroup();
    this.handleNextActionList();
    this.cdr.detectChanges();
  }

  removeAction(index: number) {
    this.actionPipeline.splice(index, 1);
    this.handleNextActionList();
    this.actionsFiled.removeAt(index);
    this.cdr.detectChanges();
  }

  handleNextActionList() {
    const action = this.actionPipeline[this.actionPipeline.length -1];

    if (action.nextActionSuggests?.length) {
      this.suggestedActions = action.nextActionSuggests.map(type => ACTION_LIST.find(item => item.type === type));
      this.requiredActions = [];
    }

    if (!action) {
      this.suggestedActions = ACTION_LIST.filter(item => RuleAction.Condition === item.type);
    }
  }

  private prepareData(): void {
    if (!this.overlayData.rule) {
      const conditionAction = ACTION_LIST.find(item => item.type === RuleAction.Condition);
      this.addAction(conditionAction);
      this.handleNextActionList();

      return;
    }

    if (this.overlayData.action !== ActionType.Duplicate) {
       this.ruleForm.get('name').setValue(this.overlayData.rule.name);
    }
    this.ruleForm.get('description').setValue(this.overlayData.rule.description);

    this.overlayData.rule.actions.forEach((item) => {
      const action = ACTION_LIST.find(action => action.type === item.type);
      this.addAction(action);
    });
  }

  private addFormGroup() {
    const newForm = this.fb.group({});
    this.actionsFiled.push(newForm);
  }

  private saveSubscribe(): void {
    this.overlayConfig.onSave$
      .pipe(
        skip(1),
        takeUntil(this.destroy$),
        tap((done: boolean) => {
          if (!done) {
            this.observableService.rule = null;
          } else {
            this.handleValidForm();
          }
        }),
        skipWhile(() => !this.overlayConfig.onError$),
        switchMap(() =>
          this.overlayConfig.onError$.pipe(
            takeUntil(this.destroy$),
            tap((error: string) => {
              this.handleFormErrors(error);
            }),
          ),
        ),
      )
      .subscribe();
  }

  private handleValidForm() {
    this.ruleForm.updateValueAndValidity();
    if (this.ruleForm.invalid) {
      this.showErrors = true;
    } else {
      this.handleRuleChanges();
    }
  }

  private handleFormErrors(error: string) {
    if (error) {
      this.nameError = error;
      this.showErrors = true;
    } else {
      this.nameError = null;
      this.overlayConfig.onCloseSubject$.next();
    }
    this.cdr.detectChanges();
  }

  private handleRuleChanges() {
    if (!isEqual(this.ruleSnapshot, this.ruleForm.value)) {
      const actions = this.actionPipeline.map((item, index) => ({
        type: item.type,
        ...this.actionsFiled.at(index).value,
      }));

      this.observableService.rule = {
        action: this.overlayData.action,
        ruleData: {
          ...this.overlayData.rule,
          ...this.ruleForm.value,
          actions,
        },
      };
    }
  }
}

