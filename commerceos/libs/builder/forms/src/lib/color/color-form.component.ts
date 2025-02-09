import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Store } from '@ngxs/store';
import { Subject } from 'rxjs';

import { PebSecondaryTab, PebSetInspectorAction } from '@pe/builder/state';

@Component({
  selector: 'peb-color-form',
  template: `
    <peb-editor-sidebar-tabs>
      <peb-editor-sidebar-tab [title]="'builder-app.forms.background.preset' | translate">
        <peb-fill-preset [control]="formControl" (colorSelected)="blurred.emit()"></peb-fill-preset>
      </peb-editor-sidebar-tab>

      <peb-editor-sidebar-tab [title]="'builder-app.forms.background.color' | translate">
        <peb-picker [formControl]="formControl" (change)="blurred.emit()"></peb-picker>
      </peb-editor-sidebar-tab>

      <peb-editor-sidebar-tab [title]="'builder-app.forms.background.gradient' | translate" [hidden]="!enableGradient">
        <peb-gradient-form *ngIf="gradientForm" [formGroup]="gradientForm" (change)="blurred.emit()"></peb-gradient-form>
      </peb-editor-sidebar-tab>
    </peb-editor-sidebar-tabs>
  `,
  styleUrls: [
    '../../../../styles/src/lib/styles/_sidebars.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebColorForm implements OnDestroy, OnInit {
  @Input() formControl: FormControl;
  @Input() gradientForm: FormGroup;
  @Output() blurred = new EventEmitter<void>();

  activeTab = PebSecondaryTab.Preset;
  enableGradient = false;

  readonly destroy$ = new Subject<void>();

  constructor(private readonly store: Store, private readonly cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.setActiveTab();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.enableGradient = false;
  }

  private setActiveTab(): void {
    this.cdr.markForCheck();
    this.store.dispatch(new PebSetInspectorAction({
      secondaryTab: this.activeTab,
    }));
  }
}
