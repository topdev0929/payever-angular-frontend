import { TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DataGridService } from './data-grid.service';

describe('DataGridService', () => {

  let service: DataGridService;

  beforeEach(() => {

    TestBed.configureTestingModule({
      providers: [
        DataGridService,
        FormBuilder,
        { provide: ActivatedRoute, useValue: {} },
      ],
    });

    service = TestBed.inject(DataGridService);

  });

  it('should be defined', () => {

    expect(service).toBeDefined();

  });

  it('should set/get coupons', () => {

    const nextSpy = spyOn(service[`couponsStream$`], 'next').and.callThrough();
    const coupons = [{ _id: 'c-001' }];

    service.coupons = coupons as any;

    expect(nextSpy).toHaveBeenCalledWith(coupons as any);
    expect(service.coupons).toEqual(coupons as any);

  });

  it('should set/get loading', () => {

    const nextSpy = spyOn(service[`loadingStream$`], 'next').and.callThrough();

    service.loading = true;

    expect(nextSpy).toHaveBeenCalledWith(true);
    expect(service.loading).toBe(true);

  });

  it('should set/get copied folders', () => {

    const nextSpy = spyOn(service[`copiedCollectionsStream$`], 'next').and.callThrough();
    const folders = ['f-001', 'f-002'];

    service.copiedFolders = folders;

    expect(nextSpy).toHaveBeenCalledWith(folders);
    expect(service.copiedFolders).toEqual(folders);

  });

  it('should set/get copied coupons', () => {

    const nextSpy = spyOn(service[`copiedCouponsStream$`], 'next').and.callThrough();
    const copuons = ['c-001', 'c-002'];

    service.copiedCoupons = copuons;

    expect(nextSpy).toHaveBeenCalledWith(copuons);
    expect(service.copiedCoupons).toEqual(copuons);

  });

  it('should set/get selected folder', () => {

    const nextSpy = spyOn(service[`selectedFolderStream$`], 'next').and.callThrough();
    const folderId = 'f-001';

    service.selectedFolder = folderId;

    expect(nextSpy).toHaveBeenCalledWith(folderId);
    expect(service.selectedFolder).toEqual(folderId);

  });

  it('should set/get search string', () => {

    const nextSpy = spyOn(service[`searchStringStream$`], 'next').and.callThrough();

    service.searchString = 'search';

    expect(nextSpy).toHaveBeenCalledWith('search');
    expect(service.searchString).toEqual('search');

  });

  it('should create filtersFormGroup', () => {

    expect(service.filtersFormGroup).toBeDefined();
    expect(service.filtersFormGroup.value).toEqual({
      tree: [],
      toggle: false,
    });

  });

  it('should od nothing on ng destroy', () => {

    service.ngOnDestroy();

    expect().nothing();

  });

});
