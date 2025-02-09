import { Injectable } from '@angular/core';

import { DocumentSideEnum, PersonTypeEnum } from '../types';

export interface DocumentDataInterface {
  type: string; // 'jpg' for example
  filename: string;
  base64: string;
  documentType: DocumentTypes;
}

export type DocumentTypes = 'IDENTIFICATION' | 'OTHERS';

export interface SavedDocumentInterface {
  document: DocumentDataInterface;
  flowId: string;
  side: DocumentSideEnum;
  person: PersonTypeEnum;
}

@Injectable({
  providedIn: 'root',
})
export class DocsManagerService {

  private documents: SavedDocumentInterface[] = [];

  addDocument(document: DocumentDataInterface, flowId: string, person: PersonTypeEnum, side: DocumentSideEnum): void {
    this.documents.push({ document, flowId, person, side });
  }

  deleteDocuments(
    flowId: string,
    person: PersonTypeEnum,
    documentType?: DocumentTypes,
    side: DocumentSideEnum = null
  ): void {
    this.documents = this.documents.filter(d => !(d.flowId === flowId
      && d.person === person
      && (!side || d.side === side)
      && (!documentType || d.document.documentType === documentType))
    );
  }

  getDocuments(
    flowId: string,
    person: PersonTypeEnum,
    documentType?: DocumentTypes,
    side: DocumentSideEnum = null
  ): DocumentDataInterface[] {
    return this.documents.filter(d => d.flowId === flowId
        && d.person === person
        && (!side || d.side === side)
        && (!documentType || d.document.documentType === documentType)
      ).map(d => d.document);
  }

  getAllDocuments(flowId: string): DocumentDataInterface[] {
    return this.documents.filter(d => d.flowId === flowId).map(d => d.document);
  }
}
