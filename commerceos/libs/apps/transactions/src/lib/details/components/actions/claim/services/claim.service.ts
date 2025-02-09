import { Inject, Injectable } from '@angular/core';
import { FormArray } from '@angular/forms';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

import { EnvironmentConfigInterface, PE_ENV } from '@pe/common';
import { TranslateService } from '@pe/i18n-core';

import { ClaimFormInterface, DocumentOptionInterface, DocumentType } from '../types';

@Injectable()
export class ClaimService {
  constructor(
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private translateService: TranslateService,
    @Inject(PE_ENV) public env: EnvironmentConfigInterface
  ) {}

  loadIcons() {
    this.matIconRegistry.addSvgIcon(
      `remove-icon`,
      this.domSanitizer.bypassSecurityTrustResourceUrl(`${this.env.custom.cdn}/icons-transactions/remove.svg`),
    );

    this.matIconRegistry.addSvgIcon(
      `files-placeholder`,
      this.domSanitizer.bypassSecurityTrustResourceUrl(`${this.env.custom.cdn}/icons/files-placeholder.svg`),
    );

    this.matIconRegistry.addSvgIcon(
      `image-placeholder`,
      this.domSanitizer.bypassSecurityTrustResourceUrl(`${this.env.custom.cdn}/icons-transactions/image-placeholder.svg`),
    );
  }

  getTypeOptions(translationsScope: string): DocumentOptionInterface[] {
    return Object.entries(DocumentType).map(([key, value]) => ({
      value,
      label: this.translateService.translate(`${translationsScope}.labels.${key}`),
    }));
  }

  prepareActionPayload(documentsControl: FormArray): ClaimFormInterface {
    const documents = documentsControl.value.filter(item => !item.isUpload).map((item) => {
      const { documentType, fileName, base64Content, type } = item;

      return {
        documentType,
        mimeType: type,
        fileName,
        base64Content: base64Content.split(';base64,')[1],
      };
    });

    return {
      documents,
    };
  }
}
