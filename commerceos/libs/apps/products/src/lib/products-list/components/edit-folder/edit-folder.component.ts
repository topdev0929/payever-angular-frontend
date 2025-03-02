import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { BehaviorSubject, Observable } from 'rxjs';
import { skip, tap } from 'rxjs/operators';

import { TranslateService } from '@pe/i18n-core';
import { OverlayHeaderConfig, PeOverlayWidgetService, PE_OVERLAY_CONFIG, PE_OVERLAY_DATA } from '@pe/overlay-widget';
import { FolderItem } from '@pe/shared/folders';
import { SnackbarService } from '@pe/snackbar';

import { ProductsApiService } from '../../../shared/services/api.service';

@Component({
  selector: 'pe-edit-folder',
  templateUrl: './edit-folder.component.html',
  styleUrls: ['./edit-folder.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditFolderComponent {
  isSaving$ = new BehaviorSubject<boolean>(false);
  businessId: string;
  image: string;
  submited = false;

  formGroup = this.formBuilder.group({
    title: ['', [Validators.required]],
  })

  constructor(
    @Inject(PE_OVERLAY_DATA) private appData: any,
    @Inject(PE_OVERLAY_CONFIG) public config: OverlayHeaderConfig,
    private cdr: ChangeDetectorRef,
    private overlay: PeOverlayWidgetService,
    private productsApi: ProductsApiService,
    private formBuilder: FormBuilder,
    private snackbarService: SnackbarService,
    private translateService: TranslateService
  ) {
    config.doneBtnCallback = this.saveData;


    if (appData.item && appData.type === 'edit') {
      this.formGroup.controls.title.patchValue(appData.item.title);
      this.formGroup.controls.description.patchValue(appData.item?.data?.description);
      this.image = appData.item.image;
    }

    this.isSaving$.pipe(
      skip(1),
      tap((saving: boolean) => {
        this.config.doneBtnTitle = this.translateService.translate(saving ? 'saving' : 'done');
        this.config.isLoading = true;
      })
    ).subscribe();

  }

  onUpdatePicture(image) {
    this.image = image.image;
  }

  saveData = () => {
    this.submited = true;
    this.cdr.detectChanges();

    if (this.formGroup.valid) {
      const { title } = this.formGroup.value;
      let payload: any = {
        name: title,
        image: this.image,
        position: this.appData.nextPosition,
      };

      let request:  Observable<FolderItem<any>>;

      this.isSaving$.next(true);

      if (this.appData.type === 'edit') {
        payload = {
          _id: this.appData.item.id,
          ...payload,
        };

        request = this.productsApi.patchFolder(payload);
      } else {
        if (this.appData.activeItem) {
          payload.parentFolderId = this.appData.activeItem?._id ?? null;
        }

        request = this.productsApi.postFolder(payload);
      }

      request.pipe(
        ).subscribe({
          next: (data) => {
            this.config.onSaveSubject$.next({ updatedItem: data, appData: this.appData });
            this.overlay.close();
          },
          error: (error) => {
            this.snackbarService.toggle(true, {
              content: error.error.errors || error.error.message,
            });
          },
          complete: () => this.isSaving$.next(false),
        });
    }
  }
}
