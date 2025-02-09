import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { takeUntil, tap } from 'rxjs/operators';

import { PebSecondaryTab } from '@pe/builder/state';
import { PeDestroyService } from '@pe/common';

import { PebSeoFormService } from './seo-form.service';

@Component({
  selector: 'peb-seo-form',
  templateUrl: './seo-form.component.html',
  styleUrls: ['./seo-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    PeDestroyService,
  ],
})
export class PebSeoForm {

  activeTab = PebSecondaryTab.General;

  form = new FormGroup({
    title: new FormControl(),
    url: new FormControl(),
    description: new FormControl(),
    showInSearchResults: new FormControl(),
    canonicalUrl: new FormControl('', [Validators.pattern(/^[\w\s/\-_]+$/)]),
    markupData: new FormControl(),
    customMetaTags: new FormControl(),
  });

  constructor(
    private readonly seoFormService: PebSeoFormService,
    private readonly destroy$: PeDestroyService,
  ) {
    this.seoFormService.value$.pipe(
      tap((value) => {
        this.form.setValue(value);
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  update() {
    this.seoFormService.update(this.form.value);
  }
}
