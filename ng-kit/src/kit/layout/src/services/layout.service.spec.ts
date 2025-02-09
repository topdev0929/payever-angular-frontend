import { async } from '@angular/core/testing';
import { Subscription } from 'rxjs';

import { LayoutService } from './layout.service';

describe('LayoutService', () => {
  let service: LayoutService;

  beforeEach(() => {
    service = new LayoutService();
  });

  it('should emit #sidebarToggleEvent when toggleSidebar()', async(() => {
    let subscription: Subscription;
    let eventWasCalled: boolean = false;

    subscription = service.sidebarToggleEvent.subscribe(
      value => {
        eventWasCalled = true;
        expect(value).toBe(true);
      },
      fail
    );
    service.toggleSidebar();
    expect(eventWasCalled).toBe(true);
    subscription.unsubscribe();

    eventWasCalled = false;
    subscription = service.sidebarToggleEvent.subscribe(
      value => {
        eventWasCalled = true;
        expect(value).toBe(false);
      },
      fail
    );
    service.toggleSidebar();
    expect(eventWasCalled).toBe(true);
    subscription.unsubscribe();
  }));

  it('should emit #layoutClosedEvent', async(() => {
    let eventWasCalled: boolean = false;
    const subscription: Subscription = service.layoutClosedEvent.subscribe(
      value => {
        eventWasCalled = true;
        expect(value).toBe(true);
      },
      fail
    );
    service.closeLayout();
    expect(eventWasCalled).toBe(true);
    subscription.unsubscribe();
  }));
});
