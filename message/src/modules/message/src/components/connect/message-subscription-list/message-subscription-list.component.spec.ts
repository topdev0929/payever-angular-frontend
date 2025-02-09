import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { PE_OVERLAY_DATA } from '@pe/overlay-widget';
import { PeMessageIntegration } from '../../../enums';
import { PeMessageSubscriptionListComponent } from './message-subscription-list.component';

describe('PeMessageSubscriptionListComponent', () => {

  let fixture: ComponentFixture<PeMessageSubscriptionListComponent>;
  let component: PeMessageSubscriptionListComponent;
  let subscriptions: any[]
  let peOverlayData: any;

  beforeEach(waitForAsync(() => {

    subscriptions = [
      {
        enabled: false,
        integration: {
          name: 'integration.1',
        },
      },
      {
        enabled: true,
        integration: {
          name: 'integration.2',
        },
      },
    ]

    const peOverlayDataMock = {
      subscriptionList: subscriptions,
      changes: null,
    };

    TestBed.configureTestingModule({
      declarations: [PeMessageSubscriptionListComponent],
      providers: [
        FormBuilder,
        { provide: PE_OVERLAY_DATA, useValue: peOverlayDataMock },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PeMessageSubscriptionListComponent);
      component = fixture.componentInstance;

      peOverlayData = TestBed.inject(PE_OVERLAY_DATA);

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should set form on construct', () => {

    expect(component.formGroup).toBeDefined();
    expect(component.formGroup.value).toEqual({
      'integration.1': false,
      'integration.2': true,
    });
    expect(peOverlayData.changes).toBeNull();

    component.formGroup.patchValue({
      'integration.2': false,
    });
    expect(peOverlayData.changes).toEqual({
      'integration.1': false,
      'integration.2': false,
    });

  });

  it('should get label', () => {

    const labels: { [key: string]: string } = {
      [PeMessageIntegration.WhatsApp]: 'WhatsApp',
      [PeMessageIntegration.FacebookMessenger]: 'Facebook Messenger',
      [PeMessageIntegration.Payever]: 'Live Chat',
      [PeMessageIntegration.Telegram]: 'Telegram',
    };

    Object.keys(labels).forEach(key => expect(component.getLabel(key)).toEqual(labels[key]));

  });

});
