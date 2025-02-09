import { AfterViewChecked, Component, Injector, Input, OnInit, QueryList, ViewChildren, ViewEncapsulation } from '@angular/core';
import { BehaviorSubject, Observable, of, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { MatExpansionPanel } from '@angular/material/expansion';

import { AuthTokenInterface } from '../../../../../shared';
import { ShopsystemsBaseAccordionComponent } from '../base-accordion.component';

@Component({
  selector: 'plugin-main-wrap',
  templateUrl: './plugin-main-wrap.component.html',
  styleUrls: ['./plugin-main-wrap.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PluginMainWrapComponent extends ShopsystemsBaseAccordionComponent implements OnInit, AfterViewChecked {

  @ViewChildren('panel') panels: QueryList<MatExpansionPanel>;

  @Input('name') set setName(name: string) {
    if (this.name !== name) {
      this.name = name;
      this.apiKeys$ = this.stateService.getPluginApiKeys(name).pipe(takeUntil(this.destroyed$));
    }
  }

  @Input() maxKeys: number = 999;
  @Input() title: string = null;
  @Input() forceHideSectionApiKeys: boolean = false;
  @Input() forceHideSectionDownloads: boolean = false;

  name: string = null;
  apiKeys$: Observable<AuthTokenInterface[]> = of(null);
  isAddingKey$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private showFirstPanelRequired: boolean = true;


  constructor(injector: Injector) {
    super(injector);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.isAddingKey$.pipe(takeUntil(this.destroyed$)).subscribe();
  }

  ngAfterViewChecked() {
    if (this.panels && this.showFirstPanelRequired) {
      this.showFirstPanelRequired = false;
      timer(100).pipe(takeUntil(this.destroyed$)).subscribe(() => {
        this.showFirstPanel(this.panels);
      });
    }
  }
}
