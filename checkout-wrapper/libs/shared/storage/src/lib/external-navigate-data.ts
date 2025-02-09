import { Injectable } from '@angular/core';

interface QueryParams {[key: string]: string; }

const win = window as any;

@Injectable()
export class ExternalNavigateData {

  // This is needed to share data between external site and micro after redirect from external.
  // We don't care about flow id here, because we store data in session and new tab cleans it anyway

  extractFromUrlAndSave(flowId: string): void {
    const params: QueryParams = this.getQueryParams();
    Object.entries(params || {}).forEach(([key, value]) => {
      win[this.makeWinKey(flowId, key)] = value;
      try {
        sessionStorage.setItem(this.makeKey(flowId, key), value);
      } catch (e) {}
    });
  }

  getValue(flowId: string, key: string): string {
    let value = win[this.makeWinKey(flowId, key)];
    try {
      value = sessionStorage.getItem(this.makeKey(flowId, key));
    } catch (e) {}

    return value;
  }

  clearValue(flowId: string, key: string): void {
    delete win[this.makeWinKey(flowId, key)];
    try {
      sessionStorage.removeItem(this.makeKey(flowId, key));
    } catch (e) {}
  }

  protected getQueryParams(): QueryParams {
    const query: string = window.location.search.substring(1);
    const vars: string[] = query.split('&');
    const result: QueryParams = {};
    for (const v of vars) {
      const pair = v.split('=');
      const key = decodeURIComponent(pair[0]);
      const value = decodeURIComponent(pair[1]);
      result[key] = value || '';
    }

    return result;
  }

  private makeWinKey(flowId: string, key: string): string {
    return `pe_external_navigate_strorage_${this.makeKey(flowId, key)}`;
  }

  private makeKey(flowId: string, paramKey: string): string {
    return `pe_external_navigate_param_${flowId}_${paramKey}`;
  }
}
