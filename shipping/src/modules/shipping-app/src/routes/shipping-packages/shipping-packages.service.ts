import { Injectable, Inject } from '@angular/core';
import { PackageTypeEnum } from '../../enums/PackageTypeEnum';
import { HttpClient } from '@angular/common/http';
import { catchError, map, take, tap } from 'rxjs/operators';
import { ShippingBoxInterface } from '../../interfaces';
import { PEB_SHIPPING_API_PATH } from '../../constants';
import {
  TreeFilterNode,
  EnvService,
  MenuSidebarFooterData,
  AppThemeEnum,
} from '@pe/common';
import { BehaviorSubject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@pe/i18n';
import { PeOverlayConfig, PeOverlayRef, PeOverlayWidgetService } from '@pe/overlay-widget';
import { PebNewPackageComponent } from './envelopes/new-package-modal/new-package.component';
import { ConfirmDialogService } from '../shipping-profiles/browse-products/dialogs/dialog-data.service';
import { AbstractComponent } from '../../misc/abstract.component';

@Injectable({ providedIn: 'any' })
export class PebShippingPackagesService extends AbstractComponent{
  theme = this.envService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData?.themeSettings?.theme]
    : AppThemeEnum.default;
  isSidebarClosed$ = new BehaviorSubject(false);
  refreshTreeData$ = new BehaviorSubject(null);
  refreshData$ = new BehaviorSubject(null);
  dialogRef: PeOverlayRef;
  onSaveSubject$ = new BehaviorSubject<any>(null);
  readonly onSave$ = this.onSaveSubject$.asObservable();

  constructor(
    private http: HttpClient,
    @Inject(PEB_SHIPPING_API_PATH) private shippingApiPath: string,
    private envService: EnvService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    protected translateService: TranslateService,
    private overlayService: PeOverlayWidgetService,
    private confirmDialog: ConfirmDialogService,
  ) {
    super(translateService);
  }

  private get businessId() {
    return this.envService.businessId;
  }

  public get refreshTreeData() {
    return this.refreshTreeData$;
  }

  private baseUrl = `${this.shippingApiPath}/business/${this.businessId}/shipping-box`;

  sidebarFooterData: MenuSidebarFooterData = {
    headItem: {
      title: this.translateService.translate('shipping-app.packages_nav.name'),
    },
    menuItems: [
      {
        title: this.translateService.translate('shipping-app.modal_header.title.new_package'),
        onClick: () => {
          const config: PeOverlayConfig = {
            data: { new: PackageTypeEnum.Envelope },
            headerConfig: {
              title: this.translateService.translate('shipping-app.modal_header.title.new_package'),
              backBtnTitle: this.translateService.translate('shipping-app.actions.cancel'),
              backBtnCallback: () => {
                this.showConfirmationWindow(this.getConfirmationContent('package', 'adding'), this.dialogRef);
              },
              doneBtnTitle: this.translateService.translate('shipping-app.actions.done'),
              doneBtnCallback: () => {
                this.onSaveSubject$.next(this.dialogRef);
              },
              onSaveSubject$: this.onSaveSubject$,
              onSave$: this.onSave$,
              theme: this.theme,
            },
            backdropClick: () => {
              this.showConfirmationWindow(this.getConfirmationContent('package', 'adding'), this.dialogRef);
            },
            component: PebNewPackageComponent,
          };
          this.dialogRef = this.overlayService.open(config);
          this.dialogRef.afterClosed
            .pipe(
              tap((data) => {
                if (data) {
                  if (data?.kind === 'Carrier') {
                    this.addCarrierPackage(data?.data)
                      .pipe(
                        tap((_) => {
                          this.refreshData$.next(null);
                          this.refreshTreeData$.next(null);
                        }),
                        catchError((err) => {
                          throw new Error(err.message);
                        }),
                      ).subscribe();
                  } else {
                    this.addPackage(data)
                      .pipe(
                        tap((_) => {
                          this.refreshData$.next(null);
                          this.refreshTreeData$.next(null);
                        }),
                        catchError((err) => {
                          throw new Error(err);
                        }),
                      ).subscribe();
                  }
                }
              }),
            )
            .subscribe();
        },
      },
    ],
  };

  getBoxes() {
    return this.http.get(this.baseUrl).pipe(
      map((boxes: any) => {
        return boxes.filter((box) => {
          return box.type === PackageTypeEnum.Box;
        });
      }),
    );
  }

  getEnvelopes() {
    return this.http.get(this.baseUrl).pipe(
      map((envelopes: any) => {
        return envelopes.filter((envelope) => {
          return envelope.type === PackageTypeEnum.Envelope;
        });
      }),
    );
  }

  getSoftPackage() {
    return this.http.get(this.baseUrl).pipe(
      map((softPackages: any) => {
        return softPackages.filter((softPackage) => {
          return softPackage.type === PackageTypeEnum.Soft;
        });
      }),
    );
  }

  getCarrierBoxes() {
    return this.http.get(`${this.baseUrl}/carrier-boxes`);
  }

  getTreeData() {
    const treeData: TreeFilterNode[] = [
      {
        id: 'envelopes',
        name: 'shipping-app.packages_nav.envelopes',
        image: 'assets/sidebar-icons/shipping.svg',
        children: [],
      }, {
        id: 'boxes',
        name: 'shipping-app.packages_nav.boxes',
        image: 'assets/sidebar-icons/shipping.svg',
        children: [],
      }, {
        id: 'soft-packages',
        name: 'shipping-app.packages_nav.soft_packages',
        image: 'assets/sidebar-icons/shipping.svg',
        children: [],
      },
    ];
    return treeData;
  }

  editPackage(id: string, data: ShippingBoxInterface) {
    const payload: ShippingBoxInterface = {
      name: data.name,
      dimensionUnit: data.dimensionUnit,
      weightUnit: data.weightUnit,
      length: data.length,
      width: data.width,
      height: data.height,
      weight: data.weight,
      type: data.type,
      isDefault: data.isDefault,
    };

    return this.http.put(`${this.baseUrl}/${id}`, payload);
  }

  addPackage(payload: ShippingBoxInterface) {
    return this.http.post(`${this.baseUrl}`, payload);
  }

  addCarrierPackage(payload) {
    return this.http.post(`${this.baseUrl}`, payload);
  }

  deletePackage(id: string) {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  showConfirmationWindow(dialogContent, dialogRef) {
    this.confirmDialog.open({
      cancelButtonTitle: this.translateService.translate('shipping-app.actions.no'),
      confirmButtonTitle: this.translateService.translate('shipping-app.actions.yes'),
      ...dialogContent,
    });

    this.confirmDialog.onConfirmClick().pipe(
      take(1),
    ).subscribe(() => {
      dialogRef.close();
    });
  }
}
