import { Component, OnInit } from '@angular/core';
import { FormBuilder, AbstractControl, FormGroup, FormControl, Validators } from '@angular/forms';
import { v4 as uuid } from 'uuid';
import { Subject, timer } from 'rxjs';
import { map } from 'rxjs/operators';

import { PriceInputValueSetterType } from '../../../../kit/price/price.component';

@Component({
  selector: 'doc-forms',
  templateUrl: 'form-doc.component.html',
  styleUrls: ['./form-doc.component.scss']
})
export class FormDocComponent  implements OnInit {
  form: FormGroup = null;
  uuid: string;
  setPriceInputValue: Subject<PriceInputValueSetterType> = new Subject();

  priceExample: string = require('raw-loader!./examples/price-example.html.txt');

  counterExample: string = require('raw-loader!./examples/counter-example.html.txt');

  feedbackExample: string = require('raw-loader!./examples/feedback-example.html.txt');

  formFieldsetExample1TemplateHtml: string = require('raw-loader!./examples/form-fieldset-example-1-template.html.txt');
  formFieldsetExample1ComponentHtml: string = require('raw-loader!./examples/form-fieldset-example-1-component.html.txt');

  formFieldExampleTemplateHtml: string = require('raw-loader!./examples/form-field-example-template.html.txt');
  formFieldExampleComponentHtml: string = require('raw-loader!./examples/form-field-example-component.html.txt');

  emailFormControl: FormControl;
  commentFormControl: FormControl;

  constructor(private formBuilder: FormBuilder) {
    this.uuid = uuid();
  }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      defaultForm: this.createDefaultForm(),
      tableForm: this.createTableForm(),
      tableFormWhite: this.createTableFormWhite(),
      subscribeForm: this.createSubscribeForm()
    });
    this.defaultFormModify();
    this.tableFormModify();
    this.tableFormWhiteModify();
    this.createInputForm();
    this.changePriceInputValue();
  }

  get defaultForm(): AbstractControl {
    return this.form.get('defaultForm');
  }

  get tableForm(): AbstractControl {
    return this.form.get('tableForm');
  }

  get tableFormWhite(): AbstractControl {
    return this.form.get('tableFormWhite');
  }

  get subscribeForm(): AbstractControl {
    return this.form.get('subscribeForm');
  }

  onClickAddonAppend(): void {
    
  }

  onClickAddonPrepend(): void {
    
  }

  handlePriceValue(event: {event: MouseEvent}): void {
      
  }

  handleCounterValue(value: number): void {
      
  }

  handleFeedbackValue(event: {event: MouseEvent}): void {
      
  }

  private createDefaultForm(): FormGroup {
    return this.formBuilder.group({
      text: '',
      text2: '',
      text3: '',
      text4: '',
      text5: 'Error value',
      text6: '',
      text7: 'Field filled',
      textarea: '',
      textarea2: 'Error value',
      radio: 'value1',
      radio2: '',
      radio3: '',
      radio4: 'value7',
      radio5: '',
      radio6: '',
      checkbox: true,
      checkbox2: false,
      checkbox3: false,
      checkbox4: false,
      checkbox5: false,
      checkbox6: true,
      checkbox7: true,
      checkbox8: true,
      checkbox9: false,
      checkbox10: false,
      checkbox11: false,
      select: '',
      select2: '',
      file: ''
    });
  }

  private createTableForm(): FormGroup {
    return this.formBuilder.group({
      text: '',
      text2: 'Error field',
      text3: 'Warning field',
      text4: 'Success field',
      text5: 'Disabled field',
      text6: 'Error value',
      text7: '',
      select: '',
      select2: '',
      select3: '',
      select4: '',
      select5: '',
      textarea: '',
      textarea2: 'Text with an error',
      checkbox: false,
      checkbox2: true,
      checkbox3: false,
      radio: false,
      radio2: false
    });
  }

  private createTableFormWhite(): FormGroup {
    return this.formBuilder.group({
      text: '',
      text2: 'Error field',
      text3: 'Warning field',
      text4: 'Success field',
      text5: 'Disabled field',
      email: '',
      password: ''
    });
  }

  private createSubscribeForm(): FormGroup {
    return this.formBuilder.group({
      email: '',
      phone: ''
    });
  }

  private defaultFormModify(): void {
    const defaultForm: AbstractControl = this.defaultForm;
    defaultForm.get('text2').disable();
    defaultForm.get('radio2').disable();
    defaultForm.get('radio4').disable();
    defaultForm.get('radio6').disable();
    defaultForm.get('checkbox3').disable();
    defaultForm.get('checkbox6').disable();
    defaultForm.get('checkbox7').disable();
    defaultForm.get('checkbox10').disable();
    defaultForm.get('select2').disable();
    window.setTimeout(() => {
      defaultForm.setErrors({
        text5: ['Error text', 'Error text2'],
        text6: ['Error text'],
        textarea2: ['Error text'],
        file: ['Error text', 'Error text2']
      });
    });
  }

  private tableFormModify(): void {
    const tableForm: AbstractControl = this.tableForm;
    tableForm.get('text5').disable();
    tableForm.get('select5').disable();
    tableForm.get('checkbox3').disable();
    window.setTimeout(() => {
      tableForm.setErrors({
        text2: ['Error table text'],
        text6: ['Error text'],
        select2: ['Error text'],
        textarea2: ['Error text for this textarea field']
      });
    });
  }

  private tableFormWhiteModify(): void {
    const tableFormWhite: AbstractControl = this.tableFormWhite;
    tableFormWhite.get('text5').disable();
  }

  private createInputForm(): void {
    this.emailFormControl = new FormControl('', [
      Validators.required,
      Validators.email
    ]);

    this.commentFormControl = new FormControl('', [
      Validators.required
    ]);
  }

  private changePriceInputValue(): void {
    timer(100)
      .pipe(map(() => '00123.40'))
      .subscribe(this.setPriceInputValue);
  }

}
