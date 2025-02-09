import {
  Component,
  ChangeDetectionStrategy,
  Input,
  ChangeDetectorRef,
  Output,
  EventEmitter,
  OnInit,
} from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { filter, takeUntil, tap } from 'rxjs/operators';

import { FlowStorage } from '@pe/checkout/storage';
import {
  ChangePaymentDataInterface,
  FlowInterface,
  FlowStateEnum,
  PaymentMethodEnum,
} from '@pe/checkout/types';
import { PeDestroyService } from '@pe/destroy';

import { ModeEnum } from '../../form-mode.enum';
import { SectionContainerService, SectionStorageService } from '../../services';

export interface SectionDataInterface<T = any> {
  name: T;
  isActive?: boolean;
  isSubmitted?: boolean;
  isDisabled?: boolean;
}

export interface SectionSchemeInterface<T = any> {
  name: T;
  title?: string;
  title$?: Observable<string>;
  continueButtonTitle?: string;
  isButtonHidden?: boolean;
  onOpenEdit?: () => boolean;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'checkout-sdk-payment-sections',
  templateUrl: './payment-sections.component.html',
  styleUrls: ['./payment-sections.component.scss'],
  providers: [PeDestroyService],
})
export class PaymentSectionsComponent implements OnInit {

  @Input() set formSections(formSectionsData: SectionDataInterface[]) {
    formSectionsData && this.panels$.next(formSectionsData);
  }

  @Input() set sectionsConfig(stepperConfig: SectionSchemeInterface[]) {
    this.sectionsConfig$.next(stepperConfig);
  }

  get sectionsConfig(): SectionSchemeInterface[] {
    return this.sectionsConfig$.value;
  }

  @Input() flow: FlowInterface;
  @Input() nodeFormOptions: any;
  @Input() doSubmit$: Subject<void>;
  @Input() allStepsReady$: Subject<boolean>;
  @Input() paymentMethod: PaymentMethodEnum;
  @Input() merchantMode = false;
  @Input() embeddedMode = false;
  @Input() isExpandAll = false;
  @Input() isBillingAddressStepVisible = false;
  @Input() submitButtonText: string = null;

  @Output() checkStepsLogic = new EventEmitter<SectionDataInterface[]>();
  @Output() finishedModalShown = new EventEmitter<boolean>();
  @Output() loadedLazyModule = new EventEmitter<SectionDataInterface[]>();
  @Output() changePaymentMethod: EventEmitter<ChangePaymentDataInterface> = new EventEmitter();
  @Output() updateFormData: EventEmitter<any> = new EventEmitter();
  @Output() submitted = new EventEmitter<any>();

  public modeEnum = ModeEnum;
  public isFinishModalShown$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public panels$ = new BehaviorSubject<SectionDataInterface[]>([]);
  public sectionsConfig$ = new BehaviorSubject<SectionSchemeInterface[]>(null);
  public continueButtonTranslation = $localize`:@@checkout_sdk.action.continue:`;
  public submitButtonTranslation = $localize`:@@checkout_sdk.action.submit_application:`;

  private formSectionsData: SectionDataInterface[] = [];

  constructor(
    protected flowStorage: FlowStorage,
    protected sectionStorageService: SectionStorageService,
    private cdr: ChangeDetectorRef,
    private sectionContainerService: SectionContainerService,
    private destroy$: PeDestroyService,
  ) {}

  ngOnInit() {
    if (this.isFlowHasFinishedPayment()) {
      this.isFinishModalShown$.next(true);
    } else if (!this.formSectionsData.length) {
      this.sectionsConfig$.pipe(
        filter(stepperConfig => !!stepperConfig),
        tap(() => this.loadLazyModuleAndComponent()),
        takeUntil(this.destroy$),
      ).subscribe();
    }
  }

  protected loadLazyModuleAndComponent(): void {
    this.formSectionsData = [];
    this.sectionsConfig.forEach((section) => {
      this.formSectionsData.push({ name: section.name, isActive: false, isSubmitted: false, isDisabled: false });
    });

    this.formSectionsData[0].isActive = true;

    const currentSection = this.flowStorage.getData(this.flow.id, 'editingSection');
    if (currentSection?.editingSection) {
      this.formSectionsData.forEach((data) => {
        data.isSubmitted = true;
        data.isActive = false;
      });

      const editingSection = this.formSectionsData.find(section => section.name === currentSection.editingSection);

      if (editingSection) {
        editingSection.isActive = true;
      }
    }

    this.loadedLazyModule.emit(this.formSectionsData);
    this.panels$.next(this.formSectionsData);
  }

  isFlowHasFinishedPayment(): boolean {
    return Boolean(
      this.flow
      && ( ( [FlowStateEnum.FINISH, FlowStateEnum.CANCEL].indexOf(this.flow.state) >= 0
          && this.sectionStorageService.isPassedPaymentData === null
        )
        || this.sectionStorageService.isPassedPaymentData )
    );
  }

  getActiveStepIndex(): number {
    let result: number = null;
    this.formSectionsData.forEach((step, stepIndex) => {
      if (step.isActive && !step.isDisabled) {
        result = stepIndex;
      }
    });

    return result;
  }

  isShowStepDescription(stepIndex: number): boolean {
    const step: SectionDataInterface = this.formSectionsData[stepIndex];

    return !step.isActive && stepIndex <= this.getActiveStepIndex();
  }

  sectionMode(step: SectionDataInterface) {
    return step.isSubmitted && !step.isActive ? ModeEnum.View : ModeEnum.Edit;
  }

  continue(value?: any) {
    if (this.isExpandAll) {
      this.continueAllSteps();
    } else {
      this.checkStepsLogic.emit(this.formSectionsData);
      this.continueSingleStep(value);
      this.panels$.next(this.formSectionsData);
    }
  }

  edit(stepIndex: number): void {
    let doEdit = true;
    if (this.sectionsConfig[stepIndex].onOpenEdit) {
      doEdit = !this.sectionsConfig[stepIndex].onOpenEdit();
    }
    if (doEdit) {
      const currentStepIndex: number = this.formSectionsData.findIndex((step: SectionDataInterface) => step.isActive);
      this.formSectionsData[currentStepIndex].isActive = false;
      this.formSectionsData[currentStepIndex].isSubmitted = false;

      this.formSectionsData[stepIndex].isActive = true;
      this.formSectionsData[stepIndex].isSubmitted = false;
    }
    this.cdr.detectChanges();
  }

  isLastStep(): boolean {
    const currentStep = this.formSectionsData.find((step: SectionDataInterface) => step.isActive);
    const lastActiveSection = [...this.formSectionsData].reverse().find(panel => !panel.isDisabled);

    return currentStep.name === lastActiveSection.name;
  }

  public onSubmit(value?: any): void {
    this.submitted.emit(value);
  }

  private continueAllSteps(): void {
    this.doSubmit$.next();
    const stepsIsValid = this.sectionContainerService.isValidAllForms();

    if (stepsIsValid) {
      this.finishedModalShown.emit(true);
      this.allStepsReady$.pipe(
        filter(ready => !!ready),
        tap(() => this.isFinishModalShown$.next(true)),
        takeUntil(this.destroy$)
      ).subscribe();
    }
  }

  private continueSingleStep(value: any): void {
    const currentStepIndex = this.formSectionsData.findIndex((step: SectionDataInterface) => step.isActive);
    if (this.isLastStep()) {
      this.onSubmit(value);
    }

    let nextStep = currentStepIndex + 1;
    while (nextStep < this.sectionsConfig.length && this.formSectionsData[nextStep].isDisabled) {
      nextStep += 1;
    }

    this.flowStorage.setData(
      this.flow.id,
      'editingSection',
      { editingSection: this.formSectionsData[currentStepIndex].name },
    );

    if (nextStep < this.sectionsConfig.length) {
      this.formSectionsData[currentStepIndex].isActive = false;
      this.formSectionsData[currentStepIndex].isSubmitted = true;

      this.formSectionsData[nextStep].isActive = true;
      this.formSectionsData[nextStep].isSubmitted = false;
      this.isFinishModalShown$.next(false);
    } else {
      this.isFinishModalShown$.next(true);
      this.finishedModalShown.emit(true);

      this.flowStorage.clearData(this.flow.id, 'editingSection');
    }
  }
}
