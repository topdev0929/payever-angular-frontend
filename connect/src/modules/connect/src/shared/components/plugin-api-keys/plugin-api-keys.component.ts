import { Component, EventEmitter, Injector, Input, Output, QueryList, ViewChildren, ViewEncapsulation } from '@angular/core';
import { MatExpansionPanel } from '@angular/material/expansion';
import { ActivatedRoute, Router } from '@angular/router';
import { Validators } from '@angular/forms';
import { BehaviorSubject, Observable, of, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { FormAbstractComponent, FormScheme, SnackBarService } from '@pe/forms';
import { TranslateService } from '@pe/i18n';

import { ApiKeysBaseComponent } from '../api-keys-base.component';
import { AuthTokenInterface } from '../../interfaces';
import { KeysStateService } from '../../services';

interface ApiKeyFormInterface {
  key: {
    name: string,
  };
}

@Component({
  selector: 'plugin-api-keys',
  templateUrl: './plugin-api-keys.component.html',
  styleUrls: ['./plugin-api-keys.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PluginApiKeysComponent extends ApiKeysBaseComponent {

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

  @Output() keysChanged: EventEmitter<void> = new EventEmitter();

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
    /*
    if (this.panels && this.showFirstPanelRequired) {
      this.showFirstPanelRequired = false;
      timer(100).pipe(takeUntil(this.destroyed$)).subscribe(() => {
        this.showFirstPanel(this.panels);
      });
    }*/
  }

  onKeyCreated(): void {
    this.isAddingKey$.next(false);
    this.keysChanged.emit();
  }

  onKeyRemoved(): void {
    this.keysChanged.emit();
  }
}
