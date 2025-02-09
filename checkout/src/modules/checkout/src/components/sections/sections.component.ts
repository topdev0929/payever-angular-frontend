import { ChangeDetectorRef, Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@pe/i18n';
import { combineLatest } from 'rxjs';
import { cloneDeep, orderBy } from 'lodash-es';

import { RootCheckoutWrapperService, StorageService } from '../../services';

import { SectionInterface } from '../../interfaces';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'checkout-sections-modal',
  templateUrl: 'sections.component.html',
  styleUrls: ['sections.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SectionsModalComponent implements OnInit { // TODO Cleanup

  @Input() withHeader: boolean = true;

  sectionsAccordionOpened: boolean = true;
  disabledSectionsStep: number;

  stepsFirst: any[] = [];
  stepsFirstDisabled: any[] = [];
  stepsSecond: any[] = [];
  stepsSecondDisabled: any[] = [];

  errorMessage: string = '';

  enabledSections: any[];
  disabledSections: any[];

  theme: string;
  isSubmitting: boolean = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private wrapperService: RootCheckoutWrapperService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private storageService: StorageService,
    private translateService: TranslateService,
  ) {
  }

  get checkoutUuid(): string {
    return this.activatedRoute.snapshot.params['checkoutUuid'] || this.activatedRoute.parent.snapshot.params['checkoutUuid'];
  }

  ngOnInit(): void {
    this.initSections();
    this.storageService.getBusiness()
      .subscribe(business => {
        this.theme = business?.themeSettings?.theme && business?.themeSettings?.theme !== 'default' ? business.themeSettings.theme : 'dark';
      });
  }

  onClose(): void { // TODO Not needed anymore
    // this.router.navigate(['../../../current'], { relativeTo: this.activatedRoute });
  }

  onDisableSection(section: any, step: number) {
    section.enabled = false;
    if (step === 1) {
      this.stepsFirst = this.stepsFirst.filter((itemSection: any) => {
        return section.code !== itemSection.code;
      });
      this.stepsFirstDisabled.push(section);
    } else {
      this.stepsSecond = this.stepsSecond.filter((itemSection: any) => {
        return section.code !== itemSection.code;
      });
      this.stepsSecondDisabled.push(section);
    }

    this.updateSections();
  }

  onEnableSection(section: any, step: number) {
    section.enabled = false;
    if (step === 1) {
      this.stepsFirstDisabled = this.stepsFirstDisabled.filter((itemSection: any) => {
        return section.code !== itemSection.code;
      });
      this.stepsFirst.push(section);
    } else {
      this.stepsSecondDisabled = this.stepsSecondDisabled.filter((itemSection: any) => {
        return section.code !== itemSection.code;
      });
      this.stepsSecond.push(section);
    }

    this.onShowDisabledSections(this.disabledSectionsStep);
    this.updateSections();
  }

  onShowDisabledSections(step: number): void {
    this.disabledSectionsStep = this.disabledSectionsStep === step ? null : step;
    this.sectionsAccordionOpened = false;
  }

  updateSections(): void {
    this.isSubmitting = true;
    // this.storageService.getCurrentCheckoutOnce().subscribe(defaultCheckout => {
    const sections = this.sections;
    for (let i = 0; i < sections.length; i++) {
      sections[i].order = i;
    }

    this.storageService.saveCheckoutSections(this.checkoutUuid, sections)
      .pipe(finalize(() => {
        this.isSubmitting = false;
        this.cdr.detectChanges();
      }))
      .subscribe(() => {
        this.wrapperService.onSettingsUpdated();
        this.onClose();
      }, (err) => {
        this.storageService.showError(err);
        this.errorMessage = this.translateService.translate('sections.errors.update');
      });
    // });
  }

  dropSection(event: CdkDragDrop<any[]>, sections: any[]) {
    const prev = Number(event.previousIndex);
    const curr = Number(event.currentIndex);
    if (prev > curr) {
      sections.forEach(section => section.order = section.order > sections[curr].order && section.order < sections[prev].order
        ? section.order + 1 : section.order);
      sections[prev].order = sections[curr].order;
      sections[curr].order++;
    } else {
      sections.forEach(section => section.order = section.order > sections[prev].order && section.order < sections[curr].order
        ? section.order - 1 : section.order);
      sections[prev].order = sections[curr].order;
      sections[curr].order--;
    }
    sections.sort((a, b) => a.order - b.order);

    this.updateSections();
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
      this.storageService.getCheckoutSectionsAvailable(this.checkoutUuid)
    ])
      .subscribe(([currentCheckout, sectionsAvailable]) => {
        let sections: SectionInterface[] = sectionsAvailable.map((x) => {
          const checkoutSection = currentCheckout.sections.find(cs => x.code === cs.code);

          return {
            ...x,
            enabled: checkoutSection ? checkoutSection.enabled : x.defaultEnabled,
            order: checkoutSection ? checkoutSection.order : x.order,
            excluded_channels: []
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
              || section.code === 'payment';
          });
        this.stepsSecondDisabled = currentCheckout.sections
          .filter((section: SectionInterface) => !section.enabled)
          .filter((section: SectionInterface) => section.code === 'user' || section.code === 'address' || section.code === 'shipping');
        this.cdr.detectChanges();
      }, () => {
        this.errorMessage = this.translateService.translate('sections.errors.get');
      });
  }

}
