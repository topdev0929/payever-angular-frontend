import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { EnvService, PE_ENV } from '@pe/common';
import { PE_OVERLAY_DATA } from '@pe/overlay-widget';
import { PeMessageEmbedComponent } from './message-embed.component';

describe('PeMessageEmbedComponent', () => {

  let fixture: ComponentFixture<PeMessageEmbedComponent>;
  let component: PeMessageEmbedComponent;

  beforeEach(waitForAsync(() => {

    const envServiceMock = {
      businessId: 'b-001',
    };

    const peOverlayDataMock = {
      channelList: [
        { _id: 'ch-001' },
        { _id: 'ch-002' },
      ],
    };

    const envConfigMock = {
      custom: {
        widgetsCdn: 'c-widgets-cdn',
      },
    };

    TestBed.configureTestingModule({
      declarations: [PeMessageEmbedComponent],
      providers: [
        { provide: EnvService, useValue: envServiceMock },
        { provide: PE_OVERLAY_DATA, useValue: peOverlayDataMock },
        { provide: PE_ENV, useValue: envConfigMock },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PeMessageEmbedComponent);
      component = fixture.componentInstance;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should handle ng init', () => {

    expect(component.embedHTMLCode).toBeUndefined();

    component.ngOnInit();

    expect(component.embedHTMLCode).toContain(`var channel = 'ch-001';`);
    expect(component.embedHTMLCode).toContain(`var business = 'b-001';`);
    expect(component.embedHTMLCode).toContain(`script.src = 'c-widgets-cdn/message/widget.min.js';`);

    component.channelId$.next('ch-007');
    expect(component.embedHTMLCode).toContain(`var channel = 'ch-007';`);

  });

  it('should change channel', () => {

    const event = 'ch-007';
    const nextSpy = spyOn(component.channelId$, 'next');

    component.changeChannel(event);

    expect(nextSpy).toHaveBeenCalledWith(event);

  });

});
