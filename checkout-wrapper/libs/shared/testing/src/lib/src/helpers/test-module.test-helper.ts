import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { importProvidersFrom } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { ApmModule, ApmService } from '@elastic/apm-rum-angular';
import { NgxsSelectSnapshotModule } from '@ngxs-labs/select-snapshot';
import { NgxsModule } from '@ngxs/store';

import { AnalyticService, AnalyticsFormService, AnalyticsModule } from '@pe/checkout/analytics';
import { DialogService } from '@pe/checkout/dialog';
import { FinishDialogService } from '@pe/checkout/finish';
import {
  FinishStatusFailComponent,
  FinishStatusPendingComponent,
  FinishStatusSuccessComponent,
  FinishStatusUnknownComponent,
  FinishWrapperComponent,
  IframeCallbackComponent,
  StatusIconComponent,
} from '@pe/checkout/finish/components';
import { FormUtilsModule } from '@pe/checkout/form-utils';
import { CheckoutFormsCoreModule } from '@pe/checkout/forms';
import { CheckoutFormsDateModule } from '@pe/checkout/forms/date';
import { CheckoutFormsInputModule } from '@pe/checkout/forms/input';
import { PluginEventsService } from '@pe/checkout/plugins';
import { SendToDeviceStorage, StorageModule } from '@pe/checkout/storage';
import { CheckoutState, FlowState, ParamsState, PaymentState, SettingsState, StepsState } from '@pe/checkout/store';
import { ContinueButtonModule } from '@pe/checkout/ui/continue-button';
import { UtilsModule } from '@pe/checkout/utils';
import { WindowEventsService, WindowSizesService } from '@pe/checkout/window';
import { PE_ENV } from '@pe/common/core';
import { PeDestroyService } from '@pe/destroy';

import { peEnvFixture } from '../fixtures';

export const CommonImportsTestHelper = () => ([
  HttpClientTestingModule,
  NoopAnimationsModule,
  FormsModule,
  MatButtonToggleModule,
  MatFormFieldModule,
  MatCheckboxModule,
  MatInputModule,
  CommonModule,
  UtilsModule,
  ReactiveFormsModule,
  MatDatepickerModule,
  MatSelectModule,
  OverlayModule,
  CheckoutFormsInputModule,
  ContinueButtonModule,
  FormUtilsModule,
  CheckoutFormsDateModule,
  AnalyticsModule,
  ApmModule,
  NgxsModule.forRoot([
    CheckoutState,
    FlowState,
    ParamsState,
    PaymentState,
    SettingsState,
    StepsState,
  ]),
  NgxsSelectSnapshotModule.forRoot(),
  RouterModule.forRoot([]),
]);

export const CommonProvidersTestHelper = () => {
  const dialogServiceSpy = {
    open: jest.fn(),
    close: jest.fn(),
    updateButtons: jest.fn(),
  };

  return [
    StorageModule,
    PeDestroyService,
    PluginEventsService,
    SendToDeviceStorage,
    WindowEventsService,
    WindowSizesService,
    ApmService,
    importProvidersFrom(
      CheckoutFormsCoreModule,
      CheckoutFormsDateModule,
      HttpClientTestingModule,
    ),
    { provide: PE_ENV, useValue: peEnvFixture() },
    { provide: DialogService, useValue: dialogServiceSpy },
    { provide: AnalyticsFormService, useClass: AnalyticService },
  ];
};

export const FinishDeclarationsTestHelper = () => ([
  FinishWrapperComponent,
  IframeCallbackComponent,
  FinishStatusSuccessComponent,
  FinishStatusPendingComponent,
  FinishStatusFailComponent,
  FinishStatusUnknownComponent,
  StatusIconComponent,
]);

export const FinishProvidersTestHelper = () => {
  const apmServiceSpy = {
    init: jest.fn(),
    observe: jest.fn(),
    apm: {
      captureError: jest.fn(),
    },
  };

  const finishDialogServiceSpy = {
    open: jest.fn(),
    close: jest.fn(),
    updateButtons: jest.fn(),
  };


  return [
    StorageModule,
    PeDestroyService,
    PluginEventsService,
    SendToDeviceStorage,
    WindowEventsService,
    WindowSizesService,
    importProvidersFrom(HttpClientTestingModule),
    importProvidersFrom(
      CheckoutFormsCoreModule,
    ),
    { provide: PE_ENV, useValue: peEnvFixture() },
    { provide: ApmService, useValue: apmServiceSpy },
    { provide: AnalyticsFormService, useClass: AnalyticService },
    { provide: FinishDialogService, useValue: finishDialogServiceSpy },
  ];
};
