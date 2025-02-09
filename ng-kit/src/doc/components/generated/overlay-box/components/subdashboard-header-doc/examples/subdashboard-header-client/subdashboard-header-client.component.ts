import { Component } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import {
  TranslateService,
  TranslationsInterface,
  SubdashboardHeaderButtonInterface,
  SubdashboardHeaderDropdownItemInterface
} from '../../../../../../../../kit';
import { imageUrlBase64Fixture } from '../../../../../../../../kit/test/fixtures';

@Component({
  selector: 'doc-subdashboard-header-client-example',
  templateUrl: './subdashboard-header-client.component.html',
  styleUrls: ['./subdashboard-header-client.component.scss'],
})
export class SubdashboardHeaderClientComponent {
  feedback: string = '';
  useLogo: boolean = true;
  showSubtitleAction: boolean = true;
  showButtons: boolean = true;
  showDropdownItems: boolean = true;
  useHeight: boolean = true;

  translationScope: string = 'ng_kit.translation-scope';
  logoSrc: string = imageUrlBase64Fixture();
  height: string = '120px';

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  subtitleAction: SubdashboardHeaderButtonInterface = {
    label: 'subdashboard-header.actions.subtitle',
    onClick: () => this.setFeedback('"SubtitleAction" clicked!')
  };

  buttons: SubdashboardHeaderButtonInterface[] = [
    {
      label: 'subdashboard-header.actions.open',
      labelTranslationArgs: {
        itemName: 'Some Item'
      },
      onClick: () => this.setFeedback('"Open" button clicked!')
    }
  ];

  dropdownItems: SubdashboardHeaderDropdownItemInterface[] = [
    {
      label: 'subdashboard-header.actions.edit',
      onClick: () => this.setFeedback('Dropdown item "Edit" clicked!')
    },
    {
      label: 'subdashboard-header.actions.delete',
      onClick: () => this.setFeedback('Dropdown item "Delete" clicked!')
    },
  ];

  private translations: TranslationsInterface = {
    ng_kit: {
      'translation-scope': {
        'subdashboard-header': {
          actions: {
            edit: 'Edit',
            delete: 'Delete',
            open: 'Open {{itemName}}',
            subtitle: 'Subtitle Action'
          },
        }
      }
    }
  };

  constructor(
    private translateService: TranslateService,
  ) {}

  setFeedback(text: string): void {
    this.feedback = text;
  }

  setTranslations(): void {
    this.translateService.addTranslations(this.translations);
  }

  toggleLoading(): void {
    this.isLoading$.next(!this.isLoading$.getValue());
  }
}
