import { Component, ChangeDetectionStrategy, Injector, Inject } from '@angular/core';
import { Validators, FormControl } from '@angular/forms';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { AddressService } from '../../../../../../../kit/address';
import { MediaConfig, MEDIA_CONFIG, MediaContainerType } from '../../../../../../../kit/media';
import {
  FormAbstractComponent,
  ErrorBag,
  FormScheme,
  FormFieldType,
  SlideToggleLabelPosition,
  SlideToggleSize,
  DescriptionAlignment,
  ButtonToggleInterface,
  ButtonToggleAlignment,
  ColorPickerAlign,
  ImagePickerStyle
} from '../../../../../../../kit/form';

interface MyFormInterface {
  slideToggleValue1: boolean;
  slideToggleValue2: boolean;
  slideToggleValue3: boolean;
  slideToggleValue4: boolean;
  colorPickerValue1: string;
  colorPickerValue2: string;
  buttonToggleValue1: string;
  buttonToggleValue2: string;
  sliderValue1: number;
  sliderValue2: number;
  imagePickerValue1: string;
  imagePickerValue2: string;
  imagePickerValue3: string;
  imagePickerValue4: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'doc-form-fieldset-store-example',
  templateUrl: 'form-fieldset-store-example.component.html',
  styleUrls: ['form-fieldset-store-example.component.scss'],
  providers: [ErrorBag]
})
export class FormFieldsetStoreExampleComponent extends FormAbstractComponent<MyFormInterface> {

  formTranslationsScope: 'test_fieldset.form';
  formScheme: FormScheme;
  stageToken: FormControl = new FormControl();
  businessUuid: FormControl = new FormControl();
  defaultImageContainer: MediaContainerType = MediaContainerType.Images;
  testFieldset: any;

  private buttonToggleIcons: ButtonToggleInterface[] = [
    {
      icon: 'icon-sb-align-left-32',
      value: 'left'
    },
    {
      icon: 'icon-sb-align-center-32',
      value: 'center'
    },
    {
      icon: 'icon-sb-align-right-32',
      value: 'right'
    }
  ];

  protected formStorageKey: string = 'test_fieldset.form';

  constructor(
    injector: Injector,
    protected errorBag: ErrorBag,
    private addressService: AddressService,
    @Inject(MEDIA_CONFIG) private mediaConfig: MediaConfig,
  ) {
    super(injector);
  }

  onSuccess(): void {
    alert('Success!');
  }

  disableAll(): void {
    this.toggleControl('slideToggleValue1', false);
    this.toggleControl('slideToggleValue2', false);
    this.toggleControl('slideToggleValue3', false);
    this.toggleControl('slideToggleValue4', false);
    this.toggleControl('colorPickerValue1', false);
    this.toggleControl('colorPickerValue2', false);
    this.toggleControl('buttonToggleValue1', false);
    this.toggleControl('buttonToggleValue2', false);
    this.toggleControl('sliderValue1', false);
    this.toggleControl('sliderValue2', false);
    this.toggleControl('imagePickerValue1', false);
    this.toggleControl('imagePickerValue2', false);
    this.toggleControl('imagePickerValue3', false);
    this.toggleControl('imagePickerValue4', false);
  }

  enableAll(): void {
    this.toggleControl('slideToggleValue1', true);
    this.toggleControl('slideToggleValue2', true);
    this.toggleControl('slideToggleValue3', true);
    this.toggleControl('slideToggleValue4', true);
    this.toggleControl('colorPickerValue1', true);
    this.toggleControl('colorPickerValue2', true);
    this.toggleControl('buttonToggleValue1', true);
    this.toggleControl('buttonToggleValue2', true);
    this.toggleControl('sliderValue1', true);
    this.toggleControl('sliderValue2', true);
    this.toggleControl('imagePickerValue1', true);
    this.toggleControl('imagePickerValue2', true);
    this.toggleControl('imagePickerValue3', true);
    this.toggleControl('imagePickerValue4', true);
  }

  saveToCache(): void {
    this.saveDataToStorage();
  }

  protected createForm(initialData: MyFormInterface): void {

    initialData = <MyFormInterface>{
      slideToggleValue1: true,
      slideToggleValue2: false,
      slideToggleValue3: true,
      slideToggleValue4: true,
      colorPickerValue1: null,
      colorPickerValue2: '#ae5fb2',
      buttonToggleValue1: 'left',
      buttonToggleValue2: 'left',
      sliderValue1: 0,
      sliderValue2: 30,
      imagePickerValue1: 'stream-c4683d96-c6f8-4479-9262-5d5617145109-MWF_7048.jpg',
      imagePickerValue2: null,
      imagePickerValue3: null,
      imagePickerValue4: null
    };

    this.form = this.formBuilder.group({
      slideToggleValue1: [initialData.slideToggleValue1, Validators.required],
      slideToggleValue2: [initialData.slideToggleValue2, Validators.required],
      slideToggleValue3: [initialData.slideToggleValue3, Validators.required],
      slideToggleValue4: [initialData.slideToggleValue4, Validators.required],
      colorPickerValue1: [initialData.colorPickerValue1, Validators.required],
      colorPickerValue2: [initialData.colorPickerValue2, Validators.required],
      buttonToggleValue1: [initialData.buttonToggleValue1, Validators.required],
      buttonToggleValue2: [initialData.buttonToggleValue2, Validators.required],
      sliderValue1: [initialData.sliderValue1, Validators.required],
      sliderValue2: [initialData.sliderValue2, Validators.required],
      imagePickerValue1: [initialData.imagePickerValue1, Validators.required],
      imagePickerValue2: [initialData.imagePickerValue2, Validators.required],
      imagePickerValue3: [initialData.imagePickerValue3, Validators.required],
      imagePickerValue4: [initialData.imagePickerValue4, Validators.required]
    });

    this.formScheme = {
      fieldsets: {
        first: [
          {
            name: 'slideToggleValue1',
            type: FormFieldType.SlideToggle,
            fieldSettings: {
              classList: 'col-xs-12 col-sm-3',
              label: 'Slide toggle field'
            }
          },
          {
            name: 'slideToggleValue2',
            type: FormFieldType.SlideToggle,
            fieldSettings: {
              classList: 'col-xs-12 col-sm-3',
              label: 'Slide toggle field'
            },
            slideToggleSettings: {
              labelPosition: SlideToggleLabelPosition.Before,
              size: SlideToggleSize.Large
            }
          },
          {
            name: 'slideToggleValue3',
            type: FormFieldType.SlideToggle,
            fieldSettings: {
              classList: 'col-xs-12 col-sm-3',
              label: 'Slide toggle field'
            },
            slideToggleSettings: {
              fullWidth: true,
              size: SlideToggleSize.Large
            }
          },
          {
            name: 'slideToggleValue4',
            type: FormFieldType.SlideToggle,
            fieldSettings: {
              classList: 'col-xs-12 col-sm-3',
              label: 'Slide toggle field'
            },
            slideToggleSettings: {
              fullWidth: true,
              labelPosition: SlideToggleLabelPosition.Before
            }
          },
          {
            name: 'colorPickerValue1',
            type: FormFieldType.ColorPicker,
            fieldSettings: {
              classList: 'col-xs-12 col-sm-3',
              label: 'Color picker label after'
            },
            colorPickerSettings: {
              align: ColorPickerAlign.Left
            }
          },
          {
            name: 'colorPickerValue2',
            type: FormFieldType.ColorPicker,
            fieldSettings: {
              classList: 'col-xs-12 col-sm-3',
              label: 'Color picker label before'
            },
            colorPickerSettings: {
              align: ColorPickerAlign.Right
            }
          },
          {
            name: 'buttonToggleValue1',
            type: FormFieldType.ButtonToggle,
            fieldSettings: {
              classList: 'col-xs-12 col-sm-3',
              label: 'Button toggle field'
            },
            buttonToggleSettings: {
              buttons: this.buttonToggleIcons
            }
          },
          {
            name: 'buttonToggleValue2',
            type: FormFieldType.ButtonToggle,
            fieldSettings: {
              classList: 'col-xs-12 col-sm-3',
              label: 'Button toggle field'
            },
            buttonToggleSettings: {
              alignment: ButtonToggleAlignment.Center,
              buttons: this.buttonToggleIcons
            }
          },
          {
            name: 'sliderValue1',
            type: FormFieldType.Slider,
            fieldSettings: {
              classList: 'col-xs-12',
              label: 'Font size'
            },
            sliderSettings: {
              showValueLabel: true,
              valueLabelAppend: 'px'
            }
          },
          {
            name: 'sliderValue2',
            type: FormFieldType.Slider,
            fieldSettings: {
              classList: 'col-xs-12',
              label: 'Font size'
            },
            sliderSettings: {
              thumbLabel: true,
              showValueLabel: false
            }
          },
          {
            name: 'imagePickerValue1',
            type: FormFieldType.ImagePicker,
            fieldSettings: {
              classList: 'col-xs-12 col-sm-4',
              label: 'Image picker label'
            },
            imagePickerSettings: this.businessUuid.valueChanges.pipe(map((data: string) => {
              return {
                placeholder: 'Add new image',
                businessUuid: data,
                container: this.defaultImageContainer,
              }
            }))
          },
          {
            name: 'imagePickerValue2',
            type: FormFieldType.ImagePicker,
            fieldSettings: {
              classList: 'col-xs-12 col-sm-4',
              label: 'Image picker label'
            },
            imagePickerSettings: this.businessUuid.valueChanges.pipe(map((data: string) => {
              return {
                placeholder: 'Add new image',
                businessUuid: data,
                container: this.defaultImageContainer,
                description: 'Upload your favicon image that will be shown in the address bar of your browser.'
              }
            }))
          },
          {
            name: 'imagePickerValue3',
            type: FormFieldType.ImagePicker,
            fieldSettings: {
              classList: 'col-xs-12 col-sm-4',
              label: 'Image picker label'
            },
            imagePickerSettings: this.businessUuid.valueChanges.pipe(map((data: string) => {
              return {
                placeholder: 'Add new image',
                businessUuid: data,
                container: this.defaultImageContainer,
                description: 'Upload your favicon image that will be shown in the address bar of your browser.',
                descriptionAlignment: DescriptionAlignment.Right
              }
            }))
          },
          {
            name: 'imagePickerValue4',
            type: FormFieldType.ImagePicker,
            fieldSettings: {
              classList: 'col-xs-12',
              label: 'Round image picker'
            },
            imagePickerSettings: this.businessUuid.valueChanges.pipe(map((data: string) => {
              return {
                placeholder: 'Logo',
                businessUuid: data,
                container: this.defaultImageContainer,
                style: ImagePickerStyle.Round
              }
            }))
          }
        ]
      }
    };

    this.testFieldset = this.formScheme.fieldsets['first'];
    this.changeDetectorRef.detectChanges();

    this.stageToken.setValue(`your token...`);
    this.businessUuid.setValue(`your business uuid...`);
    this.changeDetectorRef.detectChanges();
  }

  protected onUpdateFormData(formValues: MyFormInterface): void {
    
  }

}
