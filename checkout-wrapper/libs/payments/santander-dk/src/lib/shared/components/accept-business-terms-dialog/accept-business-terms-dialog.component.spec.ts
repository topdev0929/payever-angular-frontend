import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DIALOG_DATA } from '@pe/checkout/dialog';
import { PluginEventsService } from '@pe/checkout/plugins';

import { AcceptBusinessTermsDialogComponent } from './accept-business-terms-dialog.component';

describe('AcceptBusinessTermsDialogComponent', () => {

  let component: AcceptBusinessTermsDialogComponent;
  let fixture: ComponentFixture<AcceptBusinessTermsDialogComponent>;

  let pluginEventsService: PluginEventsService;

  const data = { flowId: 'f-001' };

  beforeEach((() => {

    TestBed.configureTestingModule({
      declarations: [
        AcceptBusinessTermsDialogComponent,
      ],
      providers: [
        PluginEventsService,
        { provide: DIALOG_DATA, useValue: data },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    pluginEventsService = TestBed.inject(PluginEventsService);

    fixture = TestBed.createComponent(AcceptBusinessTermsDialogComponent);
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
