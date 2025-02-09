import { AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { BehaviorSubject, ReplaySubject } from 'rxjs';
import { Router } from '@angular/router';
import { catchError, skip, takeUntil, tap } from 'rxjs/operators';

import {
  OverlayHeaderConfig,
  PeOverlayConfig,
  PeOverlayRef,
  PeOverlayWidgetService,
  PE_OVERLAY_CONFIG,
  PE_OVERLAY_DATA,
  PE_OVERLAY_SAVE,
} from '@pe/overlay-widget';
import { MediaContainerType, MediaUrlPipe } from '@pe/media';

import { PeBrowseProductsFormComponent } from '../browse-products/browse-products.component';
import { PeBrowseContactsFormComponent } from '../browse-contacts/browse-contacts.component';
import { PeSubscriptionApi } from '../../../api/subscription/abstract.subscription.api';
import { PeSubscriptionsModule } from '../../../subscriptions.module';

export enum BillingIntervalsEnum {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
}

@Component({
  selector: 'pe-plan-dialog',
  templateUrl: './plan-dialog.component.html',
  styleUrls: ['./plan-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MediaUrlPipe],
})
export class PePlanDialogComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild('productPibker') productPibker: any;
  @ViewChild('contactPibker') contactPibker: any;
  productsData = [];
  contactsData = [];
  subscriptionPlanForm = this.fb.group({
    name: '',
    products: [[]],
    productsData: [],
    contacts: [[]],
    contactsData: [],
    paymentOptions: [],
    trialPeriod: false,
    trialPeriodDuration: '',
    billingInterval: [BillingIntervalsEnum.MONTH],
    billingPeriod: 1,
  });
  productRef: PeOverlayRef;
  contactRef: PeOverlayRef;
  theme;

  intervalOptions = [
    { label: 'Every day', value: BillingIntervalsEnum.DAY },
    { label: 'Every week', value: BillingIntervalsEnum.WEEK },
    { label: 'Every month', value: BillingIntervalsEnum.MONTH },
    { label: 'Every year', value: BillingIntervalsEnum.YEAR },
  ];

  onSaveSubject$ = new BehaviorSubject<any>(null);
  readonly onSave$ = this.onSaveSubject$.asObservable();

  private destroyed$ = new ReplaySubject<boolean>();

  edit = this.overlayData.data ? true : false;

  constructor(
    private fb: FormBuilder,
    private peOverlayRef: PeOverlayRef,
    private mediaUrlPipe: MediaUrlPipe,
    @Inject(PE_OVERLAY_DATA) public overlayData: any,
    @Inject(PE_OVERLAY_CONFIG) public overlayConfig: OverlayHeaderConfig,
    @Inject(PE_OVERLAY_SAVE) public overlaySaveSubject: BehaviorSubject<any>,
    private overlayService: PeOverlayWidgetService,
    private subscriptionApi: PeSubscriptionApi,
    private cdr: ChangeDetectorRef,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.theme = this.overlayConfig.theme;
    if (this.edit) {
      const formData = this.overlayData.data;
      this.subscriptionPlanForm.get('name').setValue(formData.name);
      this.subscriptionPlanForm.get('billingInterval').setValue(formData.interval);
    }

    this.overlaySaveSubject.pipe(skip(1)).subscribe((dialogRef: any) => {
      if (dialogRef) {
        this.onSave();
      }
    });
  }
  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  ngAfterViewInit() {
    if (this.overlayData?.products) {
      this.overlayData?.products.forEach((item) => {
        const image = this.getMediaUrlFromImage(item.images[0]);
        this.productsData.push({ image, id: item.id, name: item.title, sku: item.sku });
      });
      this.cdr.detectChanges();
    }
  }

  onClose() {
    this.peOverlayRef.close();
  }

  onSave() {
    if (this.edit) {
      this.updateSubscriptionsPlan();
    } else {
      this.createSubscriptionsPlan();
    }
  }

  updateSubscriptionsPlan() {
    const data = this.subscriptionPlanForm.value;
    const plan = {
      name: data.name,
      interval: data.billingInterval,
      billingPeriod: data.billingPeriod,
      products: [],
    };
    const planId = this.overlayData.data._id;

    this.subscriptionApi.editPlan(planId, plan).pipe(
      takeUntil(this.destroyed$),
      tap(() => {
        this.peOverlayRef.close(true);
      }),
      catchError((err: any) => {
        this.peOverlayRef.close(false);
        throw new Error(err);
      }),
    )
    .subscribe();
  }

  createSubscriptionsPlan() {

    const products = this.productsData.map(product => product.id);
    const data = this.subscriptionPlanForm.value;
    const plan = {
      products,
      name: data.name,
      interval: data.billingInterval,
      billingPeriod: data.billingPeriod,
    };

    this.subscriptionApi.addPlan(plan).pipe(
      tap(() => {
        this.peOverlayRef.close(true);
      }),
      catchError((err) => {
        this.peOverlayRef.close(false);
        throw new Error(err);
      }),
    )
    .subscribe();
  }

  getProductsData(products) {
    return products.map((item) => {
      return { id: item.productId, name: item.name, image: item.image, sku: item.sku };
    });
  }

  getContactsData(contacts) {
    return contacts.map((item) => {
      return { id: item.contactId, name: item.name, image: item.image };
    });
  }

  getMediaUrlFromImage(image) {
    return this.mediaUrlPipe.transform(image, MediaContainerType.Products, 'grid-thumbnail' as any);
  }
  openContactDialog = () => {
    const config: PeOverlayConfig = {
      data: { data: this.subscriptionPlanForm.get('contacts').value[0] ? this.contactsData : null },
      headerConfig: {
        hideHeader: true,
        title: 'Contacts',
        backBtnTitle: 'Cancel',
        backBtnCallback: () => {
          this.contactRef.close();
        },
        doneBtnTitle: 'Done',
        doneBtnCallback: () => {
          this.onSaveSubject$.next(this.contactRef);
        },
        onSaveSubject$: this.onSaveSubject$,
        onSave$: this.onSave$,
        theme: this.theme,
      },
      component: PeBrowseContactsFormComponent,
      lazyLoadedModule: PeSubscriptionsModule,
      panelClass: 'products-dialog',
    };
    this.contactRef = this.overlayService.open(config);

    this.contactRef.afterClosed
      .pipe(
        tap((data) => {
          if (data) {
            const contacts = [];
            this.subscriptionPlanForm.get('contacts').setValue([]);
            data.forEach((element) => {
              if (element) {
                const image = element?.hasOwnProperty('images') ?
                this.getMediaUrlFromImage(element.images[0]) : element?.image;
                contacts.push({
                  image,
                  contactId: element.id,
                  name: element.title,
                  imageUrl: image,
                });
              }
            });

            this.contactsData = this.getContactsData(contacts);
            this.subscriptionPlanForm.get('contacts').patchValue(contacts);
            this.cdr.detectChanges();
          } else {
            this.contactsData = [];
            this.subscriptionPlanForm.get('contacts').setValue([]);
            this.cdr.detectChanges();
          }
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe();
  }

  openProductDialog = () => {
    const config: PeOverlayConfig = {
      data: { data: this.subscriptionPlanForm.get('products').value[0] ? this.productsData : null },
      headerConfig: {
        hideHeader: true,
        title: 'Products',
        backBtnTitle: 'Cancel',
        backBtnCallback: () => {
          this.productRef.close();
        },
        doneBtnTitle: 'Done',
        doneBtnCallback: () => {
          this.onSaveSubject$.next(this.productRef);
        },
        onSaveSubject$: this.onSaveSubject$,
        onSave$: this.onSave$,
        theme: this.theme,
      },
      component: PeBrowseProductsFormComponent,
      lazyLoadedModule: PeSubscriptionsModule,
      panelClass: 'products-dialog',
    };
    this.productRef = this.overlayService.open(config);
    this.productRef.afterClosed
      .pipe(
        tap((data) => {
          if (data) {
            const products = [];
            this.subscriptionPlanForm.get('products').setValue([]);
            data.forEach((element) => {
              if (element) {
                const image = element?.hasOwnProperty('images') ?
                this.getMediaUrlFromImage(element.images[0]) : element?.image;
                products.push({
                  image,
                  productId: element.id,
                  name: element.title,
                  sku: element.sku,
                  imageUrl: image,
                });
              }
            });

            this.productsData = this.getProductsData(products);
            this.subscriptionPlanForm.get('products').patchValue(products);
            this.cdr.detectChanges();
          } else {
            this.productsData = [];
            this.subscriptionPlanForm.get('products').setValue([]);
            this.cdr.detectChanges();
          }
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe();
  }
}
