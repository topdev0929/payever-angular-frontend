import { Injectable } from '@angular/core';
import { v4 as uuidV4 } from 'uuid';

const LOCAL_STORAGE_KEY = 'pe-live-chat-session';

interface SessionData {
  activeChatId?: string;
  sessionId: string;
}

interface PeLiveChatSessionStorage {
  [key: string]: SessionData
}

@Injectable({ providedIn: 'root' })
export class PeLiveChatSessionService {

  getActiveChatId(businessId: string): string {
    return this.getBusinessData(businessId).activeChatId;
  }

  setActiveChatId(businessId: string, value: string) {
    this.patchBusinessData(businessId, { activeChatId: value });
  }

  getSessionId(businessId: string): string {
    return this.getBusinessData(businessId).sessionId;
  }

  private patchBusinessData(businessId: string, value: Partial<SessionData>) {
    const data = this.getBusinessData(businessId);
    this.storage = {
      ...this.storage,
      [businessId]: {
        ...data,
        ...value,
      },
    };
  }

  private setBusinessData(businessId: string, value: SessionData) {
    this.storage = {
      ...this.storage,
      [businessId]: value,
    };
  }

  private getBusinessData(businessId: string): SessionData {
    const data = this.storage[businessId];
    if (!data) {
      this.setBusinessData(businessId, { sessionId: uuidV4() });
    }

    return this.storage[businessId];
  }

  private get storage() {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);

    return data ? JSON.parse(data) : {};
  }

  private set storage(value: PeLiveChatSessionStorage) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(value || {}));
  }
}
