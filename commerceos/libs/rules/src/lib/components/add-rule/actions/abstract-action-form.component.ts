import { Directive, Inject, Injector, Input } from "@angular/core";
import { FormGroup, FormGroupDirective } from "@angular/forms";

import { PE_OVERLAY_DATA } from "@pe/overlay-widget";

import { RuleOverlayData } from "../../../models/rules.model";

@Directive()
export class AbstractActionForm{
  @Input() showErrors = false;

  public formGroup: FormGroup;

  constructor(
    @Inject(PE_OVERLAY_DATA) public overlayData: RuleOverlayData,
    private formGroupDirective: FormGroupDirective,
    protected injector: Injector,
  ) {
    this.formGroup = this.formGroupDirective.form;
  }

}
