import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanDeactivate } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

import { AppTypeEnum } from '../../core/core.entities';

interface PartialThemeContext {
  businessId?: string;
  applicationId?: string;
  applicationType?: AppTypeEnum;
  channelSet?: string;
}

interface ThemeContext {
  businessId: string;
  applicationId: string;
  applicationType: AppTypeEnum;
  channelSet: string;
}

@Injectable({ providedIn: 'root' })
export class ThemeContextStore {
  contextSubject$ = new BehaviorSubject<ThemeContext>(null);

  get context(): ThemeContext {
    return this.contextSubject$.value;
  }

  get businessId(): string {
    return this.context.businessId;
  }

  get applicationId(): string {
    return this.context.applicationId;
  }

  get applicationType(): AppTypeEnum {
    return this.context.applicationType;
  }

  updateContext(newContext: PartialThemeContext): void {
    if (!newContext) {
      this.contextSubject$.next(null);
    }

    this.contextSubject$.next({
      ...(this.context || null),
      ...newContext,
    } as any);
  }
}

@Injectable({ providedIn: 'root' })
export class ThemeContextInitGuard implements CanActivate {
  constructor(private contextStore: ThemeContextStore) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    this.contextStore.updateContext({
      applicationType: route.params.appType,
      applicationId: route.params.appId,
      businessId: route.params.businessId,
    });

    return true;
  }
}

@Injectable({ providedIn: 'root' })
export class ThemeContextResetGuard implements CanDeactivate<any> {
  constructor(private contextStore: ThemeContextStore) {}

  canDeactivate(): boolean {
    this.contextStore.updateContext(null);

    return true;
  }
}
