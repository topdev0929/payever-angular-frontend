import {
  async,
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';

import { NO_ERRORS_SCHEMA } from '@angular/core';
import { I18nModule } from '@pe/ng-kit/src/kit/i18n';

import { TransactionExportsComponent } from './transaction-exports.component';
import { ApiService } from '../../../shared';
import { AuthService } from '@pe/ng-kit/src/kit/auth';
import { MatMenuModule } from '@angular/material/menu';
import { of } from 'rxjs';
import { ExportFormats } from '../../common/entries';
import { mockColumns, mockFilters } from '../../../../test-mocks';

describe('TransactionExportsComponent', () => {
  let component: TransactionExportsComponent;
  let fixture: ComponentFixture<TransactionExportsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [I18nModule.forRoot(), MatMenuModule],
      declarations: [TransactionExportsComponent],
      providers: [
        {
          provide: ApiService,
          useValue: {
            getBusinessData: () => of({}),
            exportTransactions: () =>
              of({
                headers: {
                  get: (value: string) => value,
                },
              }),
          },
        },
        {
          provide: AuthService,
          useValue: {},
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactionExportsComponent);
    component = fixture.componentInstance;
    component.columns = mockColumns;
    component.filters = mockFilters;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should downloadFile', fakeAsync(() => {
    window.URL.createObjectURL = () => '';
    component.downloadFile(ExportFormats.CSV);
    tick(2000);
    expect(component).toBeTruthy();
  }));
});
