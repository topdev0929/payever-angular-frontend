import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DIALOG_DATA } from '@pe/checkout/dialog';
import { PluginEventsService } from '@pe/checkout/plugins';

import { MarketingConsentDialogComponent } from './marketing-consent-dialog.component';

describe('AcceptBusinessTermsDialogComponent', () => {

  let component: MarketingConsentDialogComponent;
  let fixture: ComponentFixture<MarketingConsentDialogComponent>;

  let pluginEventsService: PluginEventsService;

  const data = { flowId: 'f-001' };

  beforeEach((() => {

    TestBed.configureTestingModule({
      declarations: [
        MarketingConsentDialogComponent,
      ],
      providers: [
        PluginEventsService,
        { provide: DIALOG_DATA, useValue: data },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    pluginEventsService = TestBed.inject(PluginEventsService);

    fixture = TestBed.createComponent(MarketingConsentDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

  }));

  it('should be defined', () => {

    expect(component).toBeDefined();

  });

  it('should handle ng init', () => {

    const emitModalShow = jest.spyOn(pluginEventsService, 'emitModalShow');

    component.ngOnInit();

    expect(emitModalShow).toHaveBeenCalledWith(data.flowId);

  });

});
