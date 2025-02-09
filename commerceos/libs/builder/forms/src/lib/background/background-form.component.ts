import { ChangeDetectionStrategy, Component, ElementRef, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Store } from '@ngxs/store';
import { map, switchMap, take, takeUntil, tap, throttleTime } from 'rxjs/operators';

import {
  MediaType,
  PebFillMode,
  PebFillType,
  PebUnit,
  SelectOption,
  isGradient,
  isSolid,
} from '@pe/builder/core';
import { PebMediaDialogService } from '@pe/builder/media';
import { ImageSizes, VideoSizes } from '@pe/builder/old';
import { PebSideBarService } from '@pe/builder/services';
import { PebSecondaryTab, PebSetInspectorAction } from '@pe/builder/state';
import { PeDestroyService } from '@pe/common';
import { TranslateService } from '@pe/i18n';

import { PebColorForm } from '../color';

import { PebBackgroundFormService } from './background-form.service';
import { PebStudioFillParserService } from './studio-fill-parser.service';

@Component({
  selector: 'peb-background-form',
  templateUrl: './background-form.component.html',
  styleUrls: [
    '../../../../styles/src/lib/styles/_sidebars.scss',
    './background-form.component.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PebBackgroundForm {

  @ViewChild('bgImageInput') bgImageInput: ElementRef;
  @ViewChild('videoInput') videoInput: ElementRef;

  readonly PebSecondaryTab = PebSecondaryTab;
  readonly imageSizes: typeof ImageSizes = ImageSizes;
  readonly videoSizes: typeof VideoSizes = VideoSizes;

  bgImageLoading$ = this.backgroundFormService.bgImageLoading$;
  imageBackground$ = this.backgroundFormService.imageFillPreview$;
  thumbnail$ = this.backgroundFormService.thumbnail$;
  imageFillModes$ = this.backgroundFormService.imageFillModes$;
  units$ = this.backgroundFormService.units$;

  activeTab = PebSecondaryTab.Preset;
  isImageContext = false;
  mediaType = MediaType;
  mediaTypes = [
    { name: this.translateService.translate('builder-app.forms.background.no_media'), value: MediaType.None },
    { name: this.translateService.translate('builder-app.forms.background.image'), value: MediaType.Image },
    { name: this.translateService.translate('builder-app.forms.background.video'), value: MediaType.Video },
    { name: this.translateService.translate('builder-app.forms.background.studio'), value: MediaType.Studio },
  ];

  units: PebUnit[] = [PebUnit.Percent, PebUnit.Pixel, PebUnit.Auto];
  fillType = PebFillType;
  fillMode = PebFillMode;

  imagePositionXModes: SelectOption[] = [
    { name: this.translateService.translate('builder-app.forms.background.left'), value: 'left' },
    { name: this.translateService.translate('builder-app.forms.background.center'), value: 'center' },
    { name: this.translateService.translate('builder-app.forms.background.right'), value: 'right' },
  ];

  imagePositionYModes: SelectOption[] = [
    { name: this.translateService.translate('builder-app.forms.background.top'), value: 'top' },
    { name: this.translateService.translate('builder-app.forms.background.center'), value: 'center' },
    { name: this.translateService.translate('builder-app.forms.background.bottom'), value: 'bottom' },
  ];

  videoFillModes$ = this.imageFillModes$.pipe(map(items => items.filter(item => item.value !== PebFillMode.Tile)));

  tabs: Partial<{ [tabName in PebSecondaryTab]: boolean }> = {
    [PebSecondaryTab.Preset]: true,
    [PebSecondaryTab.Color]: true,
    [PebSecondaryTab.Gradient]: true,
    [PebSecondaryTab.Media]: true,
  }

  form = this.backgroundFormService.backgroundForm;

  constructor(
    private readonly backgroundFormService: PebBackgroundFormService,
    private readonly destroy$: PeDestroyService,
    private readonly sanitizer: DomSanitizer,
    private readonly mediaDialogService: PebMediaDialogService,
    private readonly sidebarService: PebSideBarService,
    private readonly store: Store,
    private readonly matIconRegistry: MatIconRegistry,
    private readonly translateService: TranslateService,
    private readonly studioFillParserService: PebStudioFillParserService,
  ) {
    this.imageFillModes$.pipe(
      tap(items => items.forEach(item => this.matIconRegistry
        .addSvgIcon(item.icon, this.sanitizer.bypassSecurityTrustResourceUrl(`/assets/icons/${item.icon}.svg`))
      )),
      take(1),
    ).subscribe();

    this.setActiveTab();

    this.mediaDialogService.mediaSelectionListener$.pipe(
      throttleTime(0),
      switchMap(fill => this.studioFillParserService.parseFill$(fill)),
      tap((fill) => {
        const control = this.form.get(fill.type);
        control.markAsDirty();
        control.patchValue(fill);
        this.onSubmit();
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  private setActiveTab(): void {
    const fill = this.form.getRawValue();
    let tab: PebSecondaryTab;
    if (!fill?.type || isSolid(fill)) {
      tab = PebSecondaryTab.Preset
    } else if (isGradient(fill)) {
      tab = PebSecondaryTab.Gradient;
    } else {
      tab = PebSecondaryTab.Media;
    }

    this.activeTab = tab;
    this.store.dispatch(new PebSetInspectorAction({
      secondaryTab: tab,
    }));
  }

  changeBgInputHandler($event) {
    const files = $event.target.files as FileList;
    if (files.length > 0) {
      const file = files[0];
      this.form.controls.file.markAsDirty();
      this.form.controls.file.patchValue(file);
      this.bgImageInput.nativeElement.value = null;
    }
  }

  changeVideoInputHandler($event) {
    const files = $event.target.files as FileList;
    if (files.length > 0) {
      const file = files[0];
      this.form.controls.file.markAsDirty();
      this.form.controls.file.patchValue(file);
      this.videoInput.nativeElement.value = null;
    }
  }

  changeMedia() {
    const mediaType = this.form.value.mediaType;

    if (mediaType === MediaType.Image) { this.bgImageInput?.nativeElement?.click(); }
    if (mediaType === MediaType.Video) { this.videoInput?.nativeElement?.click(); }
    if (mediaType === MediaType.Studio) { this.openMediaStudio(); }
  }

  openMediaStudio() {
    this.mediaDialogService.openStudioDialog();
  }

  clickImageFillMode(select: SelectOption) {
    const imageSize = this.form.get('image');
    imageSize.markAsDirty();
    imageSize.patchValue({ fillMode: select.value });
    this.onSubmit();
  }

  clickVideoFillMode(select: SelectOption) {
    const imageSize = this.form.get('video');
    imageSize.markAsDirty();
    imageSize.patchValue({ fillMode: select.value });
    this.onSubmit();
  }

  onSubmit() {
    this.backgroundFormService.submit$.next(true);
  }

  get gradientForm() {
    return this.backgroundFormService.gradientForm;
  }

  getFillTitle(): string | undefined {
    const val = this.form.value;

    if (val.type === PebFillType.Iframe) {
      return val.iframe?.title;
    }
    if (val.type === PebFillType.ThreeJs) {
      return val['tree-js']?.title;
    }

    return '';
  }

  showBackgroundForm() {
    const colorForm = this.sidebarService.openDetail(
      PebColorForm,
      {
        backTitle: this.translateService.translate('builder-app.forms.background.fill'),
        title: this.translateService.translate('builder-app.forms.background.media_fill_color'),
      },
    );

    colorForm.instance.formControl = this.form.get('image').get('fillColor') as FormControl;

    colorForm.instance.destroy$.pipe(
      tap(() => this.store.dispatch(new PebSetInspectorAction({
        secondaryTab: PebSecondaryTab.Media,
      }))),
      takeUntil(this.destroy$),
    ).subscribe();
  }
}
