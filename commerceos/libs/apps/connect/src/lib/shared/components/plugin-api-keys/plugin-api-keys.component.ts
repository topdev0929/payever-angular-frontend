import { Component,
  EventEmitter,
  Input, OnInit, Output, QueryList, ViewChildren, ViewEncapsulation } from '@angular/core';
import { MatExpansionPanel } from '@angular/material/expansion';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AuthTokenInterface } from '../../interfaces';
import { ApiKeysBaseComponent } from '../api-keys-base.component';

@Component({
  selector: 'plugin-api-keys',
  templateUrl: './plugin-api-keys.component.html',
  styleUrls: ['./plugin-api-keys.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PluginApiKeysComponent extends ApiKeysBaseComponent implements OnInit {

  @ViewChildren('panel') panels: QueryList<MatExpansionPanel>;

  @Input('name') set setName(name: string) {
    if (this.name !== name) {
      this.name = name;
      this.apiKeys$ = this.stateService.getPluginApiKeys(name).pipe(takeUntil(this.destroy$));
    }
  }

  @Input() maxKeys = 999;
  @Input() title: string = null;
  @Input() forceHideSectionApiKeys = false;
  @Input() forceHideSectionDownloads = false;

  @Output() keysChanged: EventEmitter<void> = new EventEmitter();

  name: string = null;
  apiKeys$: Observable<AuthTokenInterface[]> = of(null);
  isAddingKey$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  ngOnInit(): void {
    super.ngOnInit();
    this.isAddingKey$.pipe(takeUntil(this.destroy$)).subscribe();
  }

  onKeyCreated(): void {
    this.isAddingKey$.next(false);
    this.keysChanged.emit();
  }

  onKeyRemoved(): void {
    this.keysChanged.emit();
  }
}
