import { Component, ChangeDetectionStrategy, Inject } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

import { PE_OVERLAY_DATA } from '@pe/overlay-widget';

import { SectionInterface } from '../../../interfaces';

export interface OptionsOverlayDataInterface {
  step: number;
  section: SectionInterface,
  remove$: Subject<{
    step: number;
    section: SectionInterface,
  }>;
}

@Component({
  selector: 'pe-options',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionOptionsFormComponent {

  public readonly section = this.overlayData.section;
  public readonly step = this.overlayData.step;

  public readonly options$ = new BehaviorSubject(this.section.options);

  constructor(
    @Inject(PE_OVERLAY_DATA) public overlayData: OptionsOverlayDataInterface,
  ) {
  }

  onChangeToggle(key: string, value: boolean): void {
    this.section.options[key] = value;
  }

  onDisableSection(): void {
    this.overlayData.remove$.next({
      section: this.section,
      step: this.step,
    });
  }
}
