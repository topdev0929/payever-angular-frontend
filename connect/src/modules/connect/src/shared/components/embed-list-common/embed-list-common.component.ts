import { Component, Injector, Input } from '@angular/core';
import { BehaviorSubject, combineLatest, timer } from 'rxjs';
import { filter, take } from 'rxjs/operators';

import { TranslationLoaderService } from '@pe/i18n';

import { BaseListCommonComponent } from '../base-list-common.component';
import { IntegrationCategory, i18nDomains } from '../../interfaces';

@Component({
  selector: 'connect-embed-list-common',
  templateUrl: './embed-list-common.component.html',
  styleUrls: [
    '../../../connect/components/list-common/list-common.component.scss', // TODO Find better solution to place that common scss
    './embed-list-common.component.scss'
  ]
})
export class EmbedListCommonComponent extends BaseListCommonComponent {

  allowUninstallAction = false;
  translationsReady$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  @Input() backPath: string = null;
  @Input() category: IntegrationCategory = null;

  translationLoaderService: TranslationLoaderService = this.injector.get(TranslationLoaderService);

  constructor(injector: Injector) {
    super(injector);
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.translationLoaderService.loadTranslations(i18nDomains).subscribe(() => {
      this.translationsReady$.next(true);
    });
    combineLatest([
      this.translationsReady$.pipe(filter(d => !!d), take(1)),
      this.gridOptions$.pipe(filter(d => !!d), take(1)),
      this.isPreLoading$.pipe(filter(d => !d), take(1)),
    ]).subscribe(() => {
      this.cdr.detectChanges();
      timer(100).subscribe(() => this.dataGridSidebarService.toggleFilters$.next());
    });
  }

  getBaseFilterCategories(): IntegrationCategory[] {
    return [this.category];
  }

  saveReturn(): void {
    this.navigationService.saveReturn(this.backPath);
  }
}
