# Form Module

UI-kit layout for form elements. 

## Usage

Import module

```typescript
import { NgModule } from '@angular/core';
import { FormModule } from '@pe/ng-kit/modules/form';

@NgModule({
  imports: [FormModule]
})
export class YourModule {
}
```

### Inputs

- `rowProperty: RowPropertyInterface` - object with form row properties. Check for available properties below on this page.
- `addonAppend: RowAddonInterface` - object with Addon append properties
- `addonPrepend: RowAddonInterface` - object with Addon prepend properties
- `fieldDecorator: FieldDecorationType` - field decorator. Available types 
are **error**, **warning**, **success**
- `fieldError: string|string[]` - validation errors 
- `fieldValue: string` - current value of field

### Outputs

- `clickAddonAppend: EventEmitter<null>` - click event on click to addon appended button
- `clickAddonPrepend: EventEmitter<null>` - click event on click to addon prepended button

## Interfaces

```typescript
type AddonButtonDecorationType = 'default' | 'success' | 'warning' | 'danger' | 'primary' | 'link' | 'blue';
type FieldType = 
  'checkbox' |
  'date' |
  'datetime-local' |
  'email' |
  'month' |
  'number' |
  'password' |
  'radio' |
  'range' |
  'search' |
  'tel' |
  'text' |
  'time' |
  'url' |
  'week' |
  'select' |
  'textarea';


interface RowPropertyInterface {
  fieldType?: FieldType;
  formWidgetClassName?: string; // additional classes for .form-design.form-widget block
  label?: string; // Label
  required?: boolean; // True if field is required 
  requiredTitle?: string; // title for required fields
  rowClassName?: string; // additional classes for form row
}

interface RowAddonInterface {
  button?: AddonButtonDecorationType; // if specified - addon will be a button.
  iconId?: string; // if specified - addon will show svg-icon with this ID.
  iconSize?: number; // if specified - svg-icon will be shown with this size. by default icon size taken from iconId through RegExp.
  text?: string; // if specified - addon will show this string. 
}
```

### FormFieldset

You can use pe-form-fieldset like that

```html
    <form
      class="form-table"
      [formGroup]="form"
      (ngSubmit)="onSubmit()">
      <pe-form-fieldset
        [fields]="formScheme.fieldsets['fieldSetName']"
        [formGroup]="form"
        [formStyle]="'default'"
        [translationScope]="'your_translation_key.form'"
        [errors]="errors$ | async"
        [isSubmitted]="isSubmitted"
        [orientation]="'horizontal'">
      </pe-form-fieldset>
    </form>
```

```typescript
export class YourComponent extends FormAbstractComponent<FormInterface> {

  reviewFieldSet: FormSchemeField[];
  protected formStorageKey: string = 'someForm';
  formScheme: FormScheme = {
    fieldsets: {
      fieldSetName: [
        {
          name: 'title',
          type: 'input',
          fieldSettings: {
            required: true,
            classList: 'col-xs-12'
          },
          inputSettings: {
            placeholder: 'Title',
            maxLength: 250,
            autocompleteAttribute: 'off'
          }
        },
        {
          name: 'description',
          type: 'textarea',
          fieldSettings: {
            required: true,
            classList: 'col-xs-12'
          },
          textareaSettings: {
            placeholder: 'Description',
            maxRows: 10,
            minRows: 6
          }
        }
      ]
    }
  };
}

interface FormInterface {
  fieldSetName: {
    title: string;
    description: string;
  }
}

```

You can find some classes to style form fields in fieldset in ui-kit/scss/blocks/project/form-field.scss