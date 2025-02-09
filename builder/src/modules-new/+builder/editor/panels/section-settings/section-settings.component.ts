import { ChangeDetectorRef, Component, Injector, Input } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError, filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';

import { PebElementType, PebPageStore, PebScreen } from '@pe/builder-core';
import { EditorState } from '@pe/builder-editor/projects/modules/editor/src/services/editor.state';
import { SectionElementComponent } from '@pe/builder-editor/projects/modules/elements/src/basic/section-component/section.component';
import { getScreenStyle } from '@pe/builder-editor/projects/modules/elements/src/utils';
import { ElementsRegistry } from '@pe/builder-editor/projects/modules/shared/services/elements.registry';
import { CheckboxLabelPosition, CheckboxSize, ColorPickerFormat, ImageUploadService } from '@pe/ng-kit/modules/form';
// tslint:disable-next-line:import-blacklist
import { FormFieldEnum } from '@pe/ng-kit/src/kit/form-core/types';
import { WidgetsSettingsBase } from '../../../common/widgets-settings-base';
import { SnackbarComponent } from '../../../components/snackbar/snackbar.component';
import { BlobUploadService } from '../../../services/blob-upload.service';
import { SnackbarService } from '../../../services/snackbar.service';

interface FormDataInterface {
  backgroundColor: string;
  isFixedHeader: boolean;
}

@Component({
  selector: 'pe-builder-section-settings',
  templateUrl: './section-settings.component.html',
  styleUrls: ['./section-settings.component.scss'],
})
export class SectionSettingsComponent extends WidgetsSettingsBase<any> {

  get isMobileMode(): boolean {
    return this.editor.screen === PebScreen.Mobile;
  }

  get id(): string {
    return this.component ? this.component.id : this.pageStore.state.id;
  }

  get isHeader(): boolean {
    if (!this.component || !this.component.element.data || !this.component.element.data.name) {
      return false;
    }

    return this.component.element.data.name === 'header';
  }

  get backgroundImage(): string {
    if (!this.component && this.pageStore && this.pageStore.state) {
      return this.pageStore && this.pageStore.state && getScreenStyle(this.pageStore.state.style.backgroundImage, this.editor.screen);
    }

    return getScreenStyle(this.component.style.backgroundImage, this.editor.screen);
  }

  get backgroundImageLabel(): string {
    return this.translateService.translate(
      this.backgroundImage ? 'section_settings.remove_background_image' : 'section_settings.add_background_image',
    );
  }

  get height$(): Observable<number> {
    return this.editor.activeElement$.pipe(
      map(activeId => this.pageStore.findElement(activeId)),
      map(pebElement => getScreenStyle(pebElement.style.height, this.editor.screen)),
    );
  }
  builderElement: PebElementType = PebElementType.Section;

  @Input() editor: EditorState;
  @Input() registry: ElementsRegistry;
  @Input() pageStore: PebPageStore;

  heightChange$ = new Subject<number>();
  component: SectionElementComponent;
  formScheme: any;

  private sectionIdToUpdate: string;
  private businessId: string;

  constructor(
    protected injector: Injector,
    private imageUploadService: ImageUploadService,
    private snackbarService: SnackbarService,
    private blobUploadService: BlobUploadService,
    private activatedRoute: ActivatedRoute,
    private ref: ChangeDetectorRef,
  ) {
    super(injector);
  }

  getInitialData(): FormDataInterface {
    this.activatedRoute.parent.params
      .pipe(
        tap((params: Params) => (this.businessId = params.businessId)),
        takeUntil(this.destroyed$),
      )
      .subscribe();

    const backgroundColor = this.component
      ? this.component.styleBackground
      : getScreenStyle(this.pageStore.state.style.background, this.editor.screen);

    const headerPosition: string =
      this.component && this.component.style ? getScreenStyle(this.component.style.position, PebScreen.Mobile) : null;
    const isFixedHeader: boolean = this.isHeader ? headerPosition === 'sticky' : null;

    return {
      backgroundColor,
      isFixedHeader,
    };
  }

  onChangeBackgroundImage(): void {
    this.backgroundImage ? this.onRemoveBackgroundImage() : this.onAddBackgroundImage();
  }

  protected createForm(): void {
    const initialData = this.getInitialData();

    this.form = this.formBuilder.group({
      backgroundColor: [initialData.backgroundColor],
      isFixedHeader: [initialData.isFixedHeader],
    });

    this.formScheme = {
      fieldsets: {
        backgroundColorFieldset: [
          {
            name: 'backgroundColor',
            type: FormFieldEnum.ColorPicker,
            fieldSettings: {
              classList: 'col-xs-12 mat-toolbar-append-item',
              label: '',
            },
            colorPickerSettings: {
              alpha: true,
              format: ColorPickerFormat.RGBA,
              onValueChange: (e): void => {
                this.updateColorFieldset$.next({
                  style: {
                    background: e.value,
                  },
                });
              },
            },
          },
        ],
        isFixedHeader: [
          {
            name: 'isFixedHeader',
            type: FormFieldEnum.Checkbox,
            fieldSettings: {
              classList: 'col-xs-12 mat-toolbar-append-item',
              label: 'Fixed Header',
            },
            checkboxSettings: {
              size: CheckboxSize.Small,
              labelPosition: CheckboxLabelPosition.Before,
              onValueChange: (event: any) => {
                const style = this.component.setScreenStyle({
                  position: event.checked ? 'sticky' : 'relative',
                  top: 0,
                  zIndex: 999,
                });

                this.pageStore.updateElement(this.component.element.id, { style });
              },
            },
          },
        ],
      },
    };

    this.changeDetectorRef.detectChanges();
  }

  protected onUpdateFormData(formValues: any): void {
    // ShapeWidgetSettingsInterface
  }

  // tslint:disable-next-line:no-empty
  protected onSuccess(): void {}

  private onRemoveBackgroundImage(): void {
    this.pageStore.updateElement(this.id, {
      style: {
        backgroundImage: null,
        backgroundSize: null,
      },
      meta: {
        loading: false,
      },
    });
  }

  private onAddBackgroundImage(): void {
    this.imageUploadService
      .selectImage()
      .pipe(
        filter((file: File) => {
          const isSizeValid: boolean = this.imageUploadService.checkImage(file, false);
          if (isSizeValid) {
            this.pageStore.updateElement(this.id, { meta: { loading: true } });
            this.sectionIdToUpdate = this.id;

            return true;
          }
          this.snackbarService.open(SnackbarComponent, 'Maximum size exceeded');

          return false;
        }),
        switchMap((file: File) => {
          return this.blobUploadService.createBlob(this.businessId, file).pipe(
            tap((blobURL: string) => {
              this.pageStore.updateElement(this.sectionIdToUpdate, {
                style: {
                  backgroundImage: `url("${blobURL}")`,
                  backgroundSize: '100% 100%',
                },
                meta: {
                  loading: false,
                },
              });

              this.sectionIdToUpdate = null;
              this.ref.detectChanges();
            }),
            catchError(e => {
              return throwError(e);
            }),
          );
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe();
  }
}
