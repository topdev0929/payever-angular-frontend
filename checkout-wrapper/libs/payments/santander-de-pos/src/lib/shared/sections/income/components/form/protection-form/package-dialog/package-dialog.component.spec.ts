import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Store } from '@ngxs/store';

import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';

import { InsurancePackageDialogComponent } from './package-dialog.component';

describe('InsurancePackageDialogComponent', () => {

  let component: InsurancePackageDialogComponent;
  let fixture: ComponentFixture<InsurancePackageDialogComponent>;

  let store: Store;
  const data = {
    informationPackage: {
      merchant: 'merchant',
      selfService: 'selfService',
    },
  };

  beforeEach(() => {

    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        { provide: MAT_DIALOG_DATA, useValue: data },
      ],
      declarations: [
        InsurancePackageDialogComponent,
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });

    store = TestBed.inject(Store);
  });

  it('should return merchant if merchantMode true', () => {
    jest.spyOn(store, 'selectSnapshot')
      .mockReturnValueOnce(true);
    fixture = TestBed.createComponent(InsurancePackageDialogComponent);
    component = fixture.componentInstance;
    expect(component.informationPackageObject).toEqual(data.informationPackage.merchant);

  });

  it('should return merchant if merchantMode false', () => {
    jest.spyOn(store, 'selectSnapshot')
      .mockReturnValueOnce(false);
    fixture = TestBed.createComponent(InsurancePackageDialogComponent);
    component = fixture.componentInstance;
    expect(component.informationPackageObject).toEqual(data.informationPackage.selfService);

  });

});
