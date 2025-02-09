import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ActionsCacheService {
  cache: { [key: string]: { initialState?: any; actions?: any[] } } = {};

  setActionsByPageId(pageId: string, actions: any[]): void {
    if (this.cache[pageId]) {
      this.cache[pageId].actions = actions;
    } else {
      this.cache[pageId] = { actions };
    }
  }

  getActionsByPageId(pageId: string): any[] {
    if (this.cache[pageId]) {
      return this.cache[pageId].actions;
    }

    return [];
  }

  setInitialStateByPageId(pageId: string, initialState: any): void {
    if (this.cache[pageId] && !this.cache[pageId].initialState) {
      this.cache[pageId].initialState = initialState;
    } else if (!this.cache[pageId]) {
      this.cache[pageId] = { initialState };
    }
  }

  getInitialStateByPageId(pageId: string): any {
    return this.cache[pageId] ? this.cache[pageId].initialState : null;
  }
}
