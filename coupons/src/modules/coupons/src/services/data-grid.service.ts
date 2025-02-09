import { Injectable, OnDestroy } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { BehaviorSubject, Observable } from 'rxjs';
import { finalize, map, switchMap, take, tap } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { PeDataGridLayoutType, TreeFilterNode, EnvService } from '@pe/common';

import { PeCouponsApi } from './abstract.coupons.api';
import { Coupon, CouponsResponse, PeCoupon } from '../misc/interfaces/coupon.interface';
import { PeCouponsGridComponent } from '../routes/grid/coupons-grid.component';

@Injectable()
export class DataGridService implements OnDestroy {

  constructor(
    private fb: FormBuilder,
    public route: ActivatedRoute,
  ) {
  }

  loadCoupons = new BehaviorSubject<boolean>(null);

  set coupons(items: Coupon[]) {
    this.couponsStream$.next(items);
  }

  get coupons(): Coupon[] {
    return this.couponsStream$.value;
  }

  set loading(value: boolean) {
    this.loadingStream$.next(value);
  }

  get loading(): boolean {
    return this.loadingStream$.value;
  }

  get copiedFolders(): string[] {
    return this.copiedCollectionsStream$.value;
  }

  set copiedFolders(ids: string[]) {
    this.copiedCollectionsStream$.next(ids);
  }

  get copiedCoupons(): string[] {
    return this.copiedCouponsStream$.value;
  }

  set copiedCoupons(ids: string[]) {
    this.copiedCouponsStream$.next(ids);
  }

  get selectedFolder(): string {
    return this.selectedFolderStream$.value;
  }

  set selectedFolder(folderId: string) {
    this.selectedFolderStream$.next(folderId);
  }


  set searchString(value: string) {
    this.searchStringStream$.next(value);
  }

  get searchString(): string {
    return this.searchStringStream$.value;
  }

  private copiedCollectionsStream$ = new BehaviorSubject<string[]>([]);
  private copiedCouponsStream$ = new BehaviorSubject<string[]>([]);
  private couponsStream$ = new BehaviorSubject<Coupon[]>([]);
  private selectedFolderStream$ = new BehaviorSubject<string>(null);
  private searchStringStream$ = new BehaviorSubject<string>(null);
  private loadingStream$ = new BehaviorSubject<boolean>(false);


  filtersFormGroup = this.fb.group({
    tree: [[]],
    toggle: [false],
  });

  ngOnDestroy() {}

}
