import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ChangeDetectorRef, Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { cloneDeep, orderBy } from 'lodash-es';
import { combineLatest, Subject, Subscription } from 'rxjs';
import { isEmpty, takeUntil, tap } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';
import { TranslateService } from '@pe/i18n';
import { PeOverlayConfig, PeOverlayRef, PeOverlayWidgetService } from '@pe/overlay-widget';

import { RegionRule, RegionRuleType, SectionInterface } from '../../interfaces';
import { RootCheckoutWrapperService, StorageService } from '../../services';
import { RegionRules } from '../../shared';

import { SectionOptionsFormComponent, OptionsOverlayDataInterface } from './options/options.component';


@Component({
  selector: 'checkout-sections-modal',
  templateUrl: 'sections.component.html',
  styleUrls: ['sections.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    PeDestroyService,
  ],
})
export class SectionsModalComponent implements OnInit { // TODO Cleanup

  @Input() withHeader = true;

  sectionsAccordionOpened = true;
  disabledSectionsStep: number;

  stepsFirst: SectionInterface[] = [];
  stepsFirstDisabled: SectionInterface[] = [];
  stepsSecond: SectionInterface[] = [];
  stepsSecondDisabled: SectionInterface[] = [];

  enabledSections: SectionInterface[];
  disabledSections: SectionInterface[];

  isSubmitting = false;

  private lastSaveSub: Subscription = null;
  private dialogRef: PeOverlayRef;

  private readonly alwaysFixedSteps = ['ocr'];

  private optionRemove$: OptionsOverlayDataInterface['remove$'] = new Subject();

  constructor(
    private activatedRoute: ActivatedRoute,
    private wrapperService: RootCheckoutWrapperService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private storageService: StorageService,
    private translateService: TranslateService,
    private overlayService: PeOverlayWidgetService,
    private destroyed$: PeDestroyService,
  ) {
  }

  get checkoutUuid(): string {
    return this.activatedRoute.snapshot.params['checkoutUuid']
      || this.activatedRoute.parent.snapshot.params['checkoutUuid'];
  }

  ngOnInit(): void {
    this.initSections();

    this.optionRemove$.pipe(
      tap(({ section, step }) => {
        this.onDisableSection(section, step);
        this.overlayService.close();
      }),
      takeUntil(this.destroyed$)
    ).subscribe();
  }

  onDisableSection(section: SectionInterface, step: number) {
    const stepsFirst = cloneDeep(this.stepsFirst);
    const stepsSecond = cloneDeep(this.stepsSecond);

    section.enabled = false;
    if (step === 1) {
      this.stepsFirst = this.stepsFirst.filter((itemSection: SectionInterface) => {
        return section.code !== itemSection.code;
      });
      this.stepsFirstDisabled.push(section);
    } else {
      this.stepsSecond = this.stepsSecond.filter((itemSection: SectionInterface) => {
        return section.code !== itemSection.code;
      });
      this.stepsSecondDisabled.push(section);
    }
    this.updateSections((updated) => {
      if (!updated) {
        this.stepsFirst = stepsFirst;
        this.stepsSecond = stepsSecond;
      }
    });
  }

  onEnableSection(section: any, step: number) {
    section.enabled = false;
    const stepsFirstDisabled = cloneDeep(this.stepsFirstDisabled);
    const stepsSecondDisabled = cloneDeep(this.stepsSecondDisabled);

    if (step === 1) {
      this.stepsFirstDisabled = this.stepsFirstDisabled.filter((itemSection: any) => {
        return section.code !== itemSection.code;
      });
      this.addSectionToList(section, this.stepsFirst);
    } else {
      this.stepsSecondDisabled = this.stepsSecondDisabled.filter((itemSection: any) => {
        return section.code !== itemSection.code;
      });
      this.addSectionToList(section, this.stepsSecond);
    }

    this.updateSections((updated) => {
      if (updated) {
        this.onShowDisabledSections(this.disabledSectionsStep);

        return;
      }

      this.stepsFirstDisabled = stepsFirstDisabled;
      this.stepsSecondDisabled = stepsSecondDisabled;
    });
  }

  openOptions(section: SectionInterface, step: number) {
    const config: PeOverlayConfig = {
      hasBackdrop: true,
      backdropClass: 'section-options-modal',
      backdropClick: () => {},
      data: {
        section,
        step,
        remove$: this.optionRemove$,
      } as OptionsOverlayDataInterface,
      headerConfig: {
        title: this.translateService.translate(`sections.sectionDetails.${section.code}.title`),
        backBtnTitle: this.translateService.translate('actions.cancel'),
        backBtnCallback: () => {
          this.dialogRef.close();
        },
        doneBtnCallback: () => {
          this.updateSections(() => {
            this.dialogRef.close();
          });
        },
        doneBtnTitle: this.translateService.translate('actions.done'),
      },
      component: SectionOptionsFormComponent,
    };

    this.dialogRef = this.overlayService.open(config);
  }

  private addSectionToList(section: SectionInterface, steps: SectionInterface[]) {
    const findAGoodSpot = () => {
      for (let idx = steps.length+1; idx > 0; idx--) {
        const tmp = steps.map(s => s.code);
        tmp.splice(idx, 0, section.code);
        const checkPaymentsStep = this.checkPaymentsStep(tmp, idx, idx);
        if (checkPaymentsStep === true) {
          return idx;
        }
      };

      return -1;
    };

    const idx = findAGoodSpot();
    if (idx === -1) {
      const err = this.translateService.translate('sections.errors.impossibleStep');
      this.storageService.showError(err);
      this.cdr.detectChanges();

      return;
    }
    steps.splice(idx, 0, section);
  }

  private checkPaymentsStep(sectionCodes: string[], curr: number, prev: number): true | string {
    moveItemInArray(sectionCodes, prev, curr);

    const violatedRule = RegionRules.find((rule) => {
      const codeIndex = sectionCodes.indexOf(rule.code);
      const targetCodeIndex = sectionCodes.indexOf(rule.targetCode);

      if (codeIndex === -1 || targetCodeIndex === -1) {
        return false;
      }

      if (rule.fixedPosition) {
        return rule.type === RegionRuleType.Before && codeIndex + 1 !== targetCodeIndex ||
        rule.type === RegionRuleType.After && codeIndex - 1 !== targetCodeIndex;
      }

      return rule.type === RegionRuleType.Before && codeIndex > targetCodeIndex ||
        rule.type === RegionRuleType.After && codeIndex < targetCodeIndex;
    });


    return violatedRule ? this.errorFromRegionRule(violatedRule) : true;
  }

  private errorFromRegionRule(rule: RegionRule) {
    const error = rule.type === RegionRuleType.Before ?
      'sections.errors.mustBeBefore' :
      'sections.errors.mustBeAfter';

    const step = this.translateService.translate(`sections.sectionDetails.${rule.code}.title`);
    const targetStep = this.translateService.translate(`sections.sectionDetails.${rule.targetCode}.title`);

    return this.translateService.translate(error, { step, targetStep });
  }

  onShowDisabledSections(step: number): void {
    this.disabledSectionsStep = this.disabledSectionsStep === step ? null : step;
    this.sectionsAccordionOpened = false;
  }

  updateSections(callback?: (updated?: boolean) => void): void {
    this.isSubmitting = true;
    const sections = this.sections;
    for (let i = 0; i < sections.length; i++) {
      sections[i].order = i;
    }

    this.lastSaveSub?.unsubscribe();
    this.lastSaveSub = this.storageService.saveCheckoutSections(this.checkoutUuid, sections).pipe(
      isEmpty(),
    )
      .subscribe({
        next: (isEmpty) => {
          !isEmpty && this.wrapperService.onSettingsUpdated();
          !!callback && callback(!isEmpty);
        },
        error: (err) => {
          this.translateService.translate(err?.message || 'errors.unknown_error');
          !!callback && callback(false);
        },
        complete: () => {
          this.isSubmitting = false;
          this.cdr.detectChanges();
        },
      });
  }

  dropSection(event: CdkDragDrop<any[]>, sectionsParam: SectionInterface[]) {
    const prev = Number(event.previousIndex);
    const curr = Number(event.currentIndex);
    const sections = sectionsParam.map(s => cloneDeep(s));
    sections.forEach((section, idx) => section.order = idx + 1);
    sections.sort((a, b) => a.order - b.order);
    const sectionsCodes =  sections.map(s => s.code);

    const checkPaymentsStep = this.checkPaymentsStep(sectionsCodes, curr, prev);
    if (checkPaymentsStep !== true) {
      this.storageService.showError(checkPaymentsStep);
      this.cdr.detectChanges();
    } else {
      this.moveSectionInArray(sections, prev, curr, sectionsParam);
      this.updateSections((updated) => {
        !updated && this.moveSectionInArray(sections, curr, prev, sectionsParam);
      });
    }
  }

  private get sections(): any[] {
    const enabledSections: any[] = this.stepsFirst
      .concat(this.stepsSecond)
      .map((section: any) => {
        section = cloneDeep(section);
        section.enabled = true;

        return section;
      });
    const disabledSections: any[] = this.stepsFirstDisabled
      .concat(this.stepsSecondDisabled)
      .map((section: any) => {
        section = cloneDeep(section);
        section.enabled = false;

        return section;
      });

    return enabledSections.concat(disabledSections);
  }

  private initSections(): void {
    combineLatest([
      this.storageService.getCheckoutByIdOnce(this.checkoutUuid),
      this.storageService.getCheckoutSectionsAvailable(this.checkoutUuid),
    ])
      .subscribe(([currentCheckout, sectionsAvailable]) => {
        let sections: SectionInterface[] = sectionsAvailable.map((x) => {
          const checkoutSection = currentCheckout.sections.find(cs => x.code === cs.code);

          return {
            ...x,
            enabled: checkoutSection ? checkoutSection.enabled : x.defaultEnabled,
            order: checkoutSection ? checkoutSection.order : x.order,
            excluded_channels: [],
            options: checkoutSection?.options ?? x?.options,
            fixed: x.fixed || this.alwaysFixedSteps.includes(x.code),
            isEnableAdd: !x.fixed || this.alwaysFixedSteps.includes(x.code),
          };
        });

        sections = orderBy(sections, ['order']);

        this.stepsFirst = sections
          .filter((section: SectionInterface) => section.enabled)
          .filter((section: SectionInterface) => section.code === 'order' || section.code === 'send_to_device');
        this.stepsFirstDisabled = sections
          .filter((section: SectionInterface) => !section.enabled)
          .filter((section: SectionInterface) => section.code === 'send_to_device');
        this.stepsSecond = sections
          .filter((section: SectionInterface) => section.enabled)
          .filter((section: SectionInterface) => {
            return section.code === 'user'
              || section.code === 'address'
              || section.code === 'shipping'
              || section.code === 'choosePayment'
              || section.code === 'payment'
              || section.code === 'ocr'
              || section.code === 'coupons';
          });
        this.stepsSecondDisabled = sections
          .filter((section: SectionInterface) => !section.enabled)
          .filter((section: SectionInterface) => {
            return section.code === 'user'
              || section.code === 'address'
              || section.code === 'shipping'
              || section.code === 'ocr'
              || section.code === 'coupons';
          });
        this.cdr.detectChanges();
      }, () => {
        this.storageService.showError(this.translateService.translate('sections.errors.get'));
      });
  }

  private moveSectionInArray(sections: SectionInterface[], prev: number, curr: number, sectionsParam: SectionInterface[]): void {
    moveItemInArray(sections, prev, curr);
    sectionsParam.length = 0;
    sections.forEach(s => sectionsParam.push(s));
    this.cdr.detectChanges();
  }
}
