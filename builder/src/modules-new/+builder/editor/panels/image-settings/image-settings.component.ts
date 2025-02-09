import { AfterViewInit, ChangeDetectionStrategy, Component, Injector, Input, OnInit, AfterContentInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { throwError } from 'rxjs';
import { catchError, filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';

import { PebElement, PebElementType, PebPageStore } from '@pe/builder-core';
import { EditorState } from '@pe/builder-editor/projects/modules/editor/src/services/editor.state';
import { parseUrl } from '@pe/builder-editor/projects/modules/editor/src/utils';
import { ButtonElementComponent } from '@pe/builder-editor/projects/modules/elements/src/basic/button-component/button.component';
import { ElementsRegistry } from '@pe/builder-editor/projects/modules/shared/services/elements.registry';
import { isValidURL } from '@pe/builder-text-editor-compat';
import { ErrorBag, FormScheme, FormSchemeField, ImageUploadService, InputChangeEvent, InputType } from '@pe/ng-kit/modules/form';
import { LinksInterface } from '@pe/ng-kit/modules/text-editor';
import { BuilderThemeApi } from '../../../api/theme.api';
import { WidgetsSettingsBase } from '../../../common/widgets-settings-base';
import { SnackbarComponent } from '../../../components/snackbar/snackbar.component';
import { ImageWidgetSettingsInterface } from '../../../entities/navbar';
import { BlobUploadService } from '../../../services/blob-upload.service';
import { SnackbarService } from '../../../services/snackbar.service';

@Component({
  selector: 'pe-builder-image-settings',
  templateUrl: 'image-settings.component.html',
  styleUrls: ['image-settings.component.scss'],
  providers: [ErrorBag],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageWidgetSettingsComponent extends WidgetsSettingsBase<ImageWidgetSettingsInterface>
  implements AfterViewInit, AfterContentInit {
  builderElement: PebElementType = PebElementType.Image;

  formScheme: FormScheme;
  hrefFieldset: FormSchemeField[];
  widthInputFieldset: FormSchemeField[];
  heightInputFieldset: FormSchemeField[];
  component: ButtonElementComponent;

  @Input() editor: EditorState;
  @Input() registry: ElementsRegistry;
  @Input() pageStore: PebPageStore;
  @Input() pages: LinksInterface[];

  constructor(
    protected injector: Injector,
    private imageUploadService: ImageUploadService,
    private blobUploadService: BlobUploadService,
    private snackbarService: SnackbarService,
    private themeApi: BuilderThemeApi,
  ) {
    super(injector);
  }

  ngAfterContentInit(): void {
    this.component.changes$.pipe(
      tap(() => {
        this.form.patchValue(this.getInitialData(), { emitEvent: false });
      }),
      takeUntil(this.destroyed$),
    ).subscribe();
  }

  get currentPageName(): string {
    let title: string = this.translateService.translate('content_editor.base_widget_settings.link_to');
    const link: string = this.form.get('link').value;
    if (link) {
      const page: LinksInterface = this.pages.find((p: LinksInterface) => p.id === link) || null;
      title = page ? page.title : title;
    } else if (this.form.get('href').value) {
      title = this.translateService.translate('content_editor.base_widget_settings.custom_link');
    }

    return title;
  }

  isActiveLink(page: LinksInterface): boolean {
    const link: string = this.form.get('link').value || '';

    return link.includes(page.id);
  }

  setCurrentPage(page: LinksInterface): void {
    this.updateData({ data: { link: page.id, customLink: null } });
    this.form.get('link').setValue(page.id);
    this.form.get('href').setValue(null);
  }

  onFormKey(event: KeyboardEvent): void {
    if (event.key.toLowerCase() === 'enter') {
      event.preventDefault();
    }
  }

  getInitialData(): ImageWidgetSettingsInterface {
    return {
      href: this.component && this.component.element.data && this.component.element.data.customLink,
      link: this.component && this.component.element.data && this.component.element.data.link,
      styles: {
        width: this.component
          ? Math.ceil(this.component.getScreenStyle(this.component.style.width))
          : 0,
        height: this.component
          ? Math.ceil(this.component.getScreenStyle(this.component.style.height))
          : 0,
      },
    };
  }

  onReplaceImage(): void {
    const element: PebElement = this.component.element;
    this.imageUploadService
      .selectImage()
      .pipe(
        filter((file: File) => {
          const isSizeValid: boolean = this.imageUploadService.checkImage(file, false);
          if (isSizeValid) {
            return true;
          }
          this.snackbarService.open(SnackbarComponent, 'Maximum size exceeded');
          this.pageStore.updateElement(element.id, { meta: { loading: true } });

          return false;
        }),
        switchMap((file: File) => {
          return this.blobUploadService.createBlob(this.themeApi.businessId, file).pipe(
            map((blobURL: string) => ({ blobURL, element })),
            catchError(() => {
              this.pageStore.removeElements([element.id]);

              return throwError(element);
            }),
          );
        }),
        tap(({ blobURL }: { blobURL: string }) => {
          this.pageStore.updateElement(element.id, {
            data: { src: blobURL },
            meta: { loading: false },
          });
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe();
  }

  protected createForm(initialData: ImageWidgetSettingsInterface): void {
    if (!this.component) {
      return;
    }
    const data = this.getInitialData();
    this.form = this.formBuilder.group({
      href: [data.href],
      link: [data.link, Validators.required],
      styles: this.formBuilder.group({
        width: [data.styles.width],
        height: [data.styles.height],
      }),
    });

    this.formScheme = {
      fieldsets: {
        hrefFieldset: [
          {
            name: 'href',
            type: 'input',
            fieldSettings: {
              classList: 'col-xs-12',
              label: '',
            },
            inputSettings: {
              placeholder: this.translateService.translate('content_editor.base_widget_settings.custom_link'),
              debounceTime: 1500,
              onValueChange: (event: InputChangeEvent) => {
                let url: string = event.value as string;

                if (!url) {
                  return;
                }

                if (!isValidURL(url)) {
                  this.updateData({ data: { customLink: null } });
                } else {
                  url = parseUrl(url);
                  this.updateData({ data: { customLink: url, link: null } });
                  this.form.get('link').setValue('null');
                }
              },
            },
          },
        ],
        widthInputFieldset: [
          {
            name: 'styles.width',
            type: 'input',
            fieldSettings: {
              classList: 'col-xs-12',
              label: '',
            },
            inputSettings: {
              type: InputType.Number,
              placeholder: 'Width',
              showNumberControls: true,
              numberMin: 0,
              numberMax: this.maxWidth,
              onFocus: (): void => {
                this.editor.editedElement = this.component.id;
              },
              onBlur: (): void => {
                this.editor.editedElement = null;
              },
              onValueChange: (event: InputChangeEvent): void => {
                const newWidth = Number(event.value);

                if (newWidth > 0) {
                  const proportionalDimentions = this.calculateProportionalDimensions(null, newWidth);
                  this.updateData({ style: proportionalDimentions });
                }
              },
            },
          },
        ],
        heightInputFieldset: [
          {
            name: 'styles.height',
            type: 'input',
            fieldSettings: {
              classList: 'col-xs-12',
              label: '',
            },
            inputSettings: {
              type: InputType.Number,
              placeholder: 'Width',
              showNumberControls: true,
              numberMin: 0,
              numberMax: this.maxHeight,
              onFocus: (): void => {
                this.editor.editedElement = this.component.id;
              },
              onBlur: (): void => {
                this.editor.editedElement = null;
              },
              onValueChange: (event: InputChangeEvent): void => {
                const newHeight = Number(event.value);

                if (newHeight > 0) {
                  const proportionalDimentions = this.calculateProportionalDimensions(newHeight, null);
                  this.updateData({ style: proportionalDimentions });
                }
              },
            },
          },
        ],
      },
    };

    Object.keys(this.formScheme.fieldsets).forEach((key: string) => {
      this[key] = this.formScheme.fieldsets[key];
    });

    this.changeDetectorRef.detectChanges();
  }

  get maxWidth(): number {
    const parentWidth: number = this.component.getScreenStyle(
      this.component.parentComponent.style.width,
    );
    const left: number = this.component.getScreenStyle(
      this.component.style.left,
    );

    if (!parentWidth) {
      const parentElementWidth: number = this.component.getScreenStyle(
        this.component.nativeElement.parentElement.offsetWidth,
      );

      return parentElementWidth - left;
    }

    return parentWidth - left;
  }

  get maxHeight(): number {
    const parentHeight: number = this.component.getScreenStyle(
      this.component.parentComponent.style.height,
    );
    const top: number = this.component.getScreenStyle(
      this.component.style.top,
    );

    if (!parentHeight) {
      const parentElementHeight: number = this.component.getScreenStyle(
        this.component.nativeElement.parentElement.offsetHeight,
      );

      return parentElementHeight - top;
    }

    return parentHeight - top;
  }

  private calculateProportionalDimensions(newHeight: number, newWidth: number): { height: number, width: number } {
    const currentWidth: number = this.component.getScreenStyle(this.component.style.width);
    const currentHeight: number = this.component.getScreenStyle(this.component.style.height);
    const currentAspectRadio = currentWidth / currentHeight;

    const finalHeight = newWidth ? newWidth / currentAspectRadio : newHeight;
    const finalWidth = newHeight ? newHeight * currentAspectRadio : newWidth;

    return (Math.round(finalHeight) <= Math.round(this.maxHeight) && Math.round(finalWidth) <= Math.round(this.maxWidth))
      ? { height: finalHeight, width: finalWidth }
      : { height: currentHeight, width: currentWidth };
  }

  // tslint:disable-next-line:no-empty
  protected onUpdateFormData(formValues: ImageWidgetSettingsComponent): void {}

  // tslint:disable-next-line:no-empty
  protected onSuccess(): void {}
}
