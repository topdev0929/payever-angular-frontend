import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';

import { NodeFlowService } from '@pe/checkout/node-api';
import { StorageService } from '@pe/checkout/storage';
import { FlowState } from '@pe/checkout/store';
import { PaymentTermsDocument, PaymentTermsDocumentMetadata } from '@pe/checkout/types';
import { camelCase } from '@pe/checkout/utils/camelcase';

import { ZiniaViewTerms } from '../models';

@Injectable({
  providedIn: 'root',
})
export class TermsService {

  constructor(
    private store: Store,
    private nodeFlowService: NodeFlowService,
    private storage: StorageService
  ) {}

  getTerms(flowId: string): Observable<ZiniaViewTerms> {
    return this.store.selectOnce(FlowState.flow).pipe(
      map(flow => flow.connectionId),
      switchMap((id) => {
        const data = this.getFromCache(flowId, id);

        return data ? of(data) : this.fetchTerms(flowId, id);
      }),
    );
  }

  private fetchTerms(flowId: string, id: string): Observable<ZiniaViewTerms> {
    return this.nodeFlowService.getTerms(id).pipe(
      map(terms => Object.entries(terms).reduce((acc, [key, value]: [string, PaymentTermsDocument[]]) => ({
        ...acc,
        [key]: value.map(item => ({
          label: this.parseText(item.text, item.metadata),
          required: item.required,
          documentId: item.documentId,
        })),
      }), {})),
      tap((terms) => {
        this.cache(flowId, id, terms);
      }),
    );
  }

  private cache(flowId: string, connectionId: string, data: ZiniaViewTerms): void {
    const key = `${flowId}-${connectionId}`;

    this.storage.set(key, JSON.stringify(data));
  }

  private getFromCache(flowId: string, connectionId: string): ZiniaViewTerms {
    const key = `${flowId}-${connectionId}`;

    return JSON.parse(this.storage.get(key));
  }

  private parseText(text: string, metadata: PaymentTermsDocumentMetadata) {
    const camelCasedMeta = camelCase(metadata);
    let parsedText = text;

    Object.entries(camelCasedMeta.assetsLinks).forEach(([key, value]) => {
      if (/^(http:\/\/|https:\/\/)/.test(value as string)) {
        parsedText = parsedText
          .replace(`<${key}>`, `<a href="${value}" target="_blank">`)
          .replace(`</${key}>`, '</a>');
      } else if (/\S+@\S+/.test(value as string)) {
        parsedText = parsedText
          .replace(`<${key}>`, `<a href="mailto:${value}">`)
          .replace(`</${key}>`, '</a>');
      }
    });

    return parsedText;
  }
}
