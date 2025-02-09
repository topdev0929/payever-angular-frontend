import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { PeCoupon } from '../misc/interfaces/coupon.interface';
import { PeFolder } from '../misc/interfaces/folder.interface';


@Injectable()
export abstract class PeCouponsApi {
  abstract getCouponsList(filter? :any): Observable<PeCoupon[]>;

  abstract getCouponById(couponId: string): Observable<PeCoupon>;

  abstract postCoupons(couponData: PeCoupon): Observable<any>;

  abstract getCouponExtraField(couponId: string): Observable<PeCoupon>;

  abstract getCouponEligibilityById(couponId: string): Observable<PeCoupon>;

  abstract getCouponByCode(couponCode: string): Observable<PeCoupon>;

  abstract createCoupon(coupon: PeCoupon): Observable<PeCoupon>;

  abstract updateCoupon(couponId: string, coupon: PeCoupon): Observable<PeCoupon>;

  abstract postCoupon(couponId: string, coupon: PeCoupon): Observable<PeCoupon>;

  abstract deleteCoupon(couponId: string): Observable<PeCoupon>;

  abstract getFolders(): Observable<PeFolder>;

  abstract getCouponsFolders(): Observable<PeFolder[]>;

  abstract getCouponsFolderById(folderId: string): Observable<PeFolder>;

  abstract updateCouponsFolder(folderId:string, folderData:PeFolder): Observable<any>;

  abstract postCouponsFolder(folderData: PeFolder): Observable<any>;

  abstract deleteCouponsFolder(folderId: string): Observable<any>;

  abstract updateCouponFolder(obj: {couponId: string, parentFolder: string}): Observable<any>;

  abstract getProducts(): Observable<any>;

  abstract getCategories(): Observable<any>;

  abstract getChannels(): Observable<any>;

  abstract getContactGroups(): Observable<any>;

  abstract getContacts(): Observable<any>;
}
