import { Component, Inject } from '@angular/core';
import { OverlayHeaderConfig, PeOverlayWidgetService, PE_OVERLAY_CONFIG, PE_OVERLAY_DATA } from '@pe/overlay-widget';
import { StudioApiService } from '../../../../../core';


@Component({
  selector: 'pe-add-field',
  templateUrl: './add-fields.component.html',
  styles: [],
})
export class PeAddFieldComponent {
  theme;

  fieldTypes = [
    {
      value: 'single_line_text',
      label: 'Single line text'
    },
    {
      value: 'paragraph_text',
      label: 'Paragraph text'
    },
    {
      value: 'number',
      label: 'Number'
    },
    {
      value: 'checkbox',
      label: 'Checkbox'
    },
    // {
    //   value: 'dropdown',
    //   label: 'Dropdown'
    // }
  ];


  attribute = {
    label: '',
    filterable: false,
    editable: false,
    type: this.fieldTypes[0].value
  };

  constructor(
    @Inject(PE_OVERLAY_DATA) private appData: any,
    @Inject(PE_OVERLAY_CONFIG) public config: OverlayHeaderConfig,
    private peMediaService: StudioApiService,
    private overlay: PeOverlayWidgetService
  ) {
    this.config.doneBtnCallback = () => this.save();
    this.theme = appData.theme;
  }

  save(): void {
    const payload = {
      businessId: this.appData.businessId,
      name: this.attribute.label,
      type: this.attribute.type,
      filterAble: this.attribute.filterable,
      onlyAdmin: this.attribute.editable,
      userAttributeGroupId: this.appData.groupId
    };

    this.peMediaService.createUserAttribute(this.appData.businessId, payload).subscribe(data => {
      this.config.onSaveSubject$.next(data);
      this.overlay.close();
    });


  }

}
