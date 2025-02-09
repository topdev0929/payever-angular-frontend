import { ChangeDetectionStrategy, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, of } from 'rxjs';
import { catchError, map, skip, takeUntil, tap } from 'rxjs/operators';

import { PeAuthService } from '@pe/auth';
import { PeDestroyService } from '@pe/common';
import {
  PE_OVERLAY_SAVE,
} from '@pe/overlay-widget';

import { FormTranslationsService } from '../../services';

import { EditSecurityQuestionService } from './edit-security-question.service';


@Component({
  selector: 'peb-edit-security-question',
  templateUrl: './edit-security-question.component.html',
  providers: [
    PeDestroyService,
    EditSecurityQuestionService,
  ],
  styles: [`
  .security-placeholder::-webkit-input-placeholder,
  .security-placeholder::placeholder {
    color: white;
    font-size: 14px;
  }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditSecurityQuestionComponent implements OnInit {

  @ViewChild('submitTrigger') submitTriggerRef: ElementRef<HTMLButtonElement>;

  public securityForm = this.formBuilder.group({
    question: ['', Validators.required],
    answer: ['', Validators.required],
  });

  constructor(
    public formTranslationsService: FormTranslationsService,
    public editSecurityQuestionService: EditSecurityQuestionService,
    @Inject(PE_OVERLAY_SAVE) public overlaySaveSubject: BehaviorSubject<any>,
    private formBuilder: FormBuilder,
    private destroyed$: PeDestroyService,
  ) {
  }

  ngOnInit(): void {
    this.editSecurityQuestionService.initQuestions();

    this.overlaySaveSubject.pipe(
      skip(1),
      tap(() => this.submitTriggerRef.nativeElement.click()),
      takeUntil(this.destroyed$)
    ).subscribe();
  }

  public onSave() {
    if (this.securityForm.valid) {
      this.editSecurityQuestionService.saveAndClose(this.securityForm.value);
    }
  }
}
