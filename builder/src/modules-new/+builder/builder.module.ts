// It's here because the production doesn't add polyfills from polyfills.ts
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatButtonModule,
  MatCheckboxModule,
  MatDividerModule,
  MatIconModule,
  MatMenuModule,
  MatProgressSpinnerModule,
  MatSelectModule,
  MatTableModule,
  MatToolbarModule,
} from '@angular/material';
import { NgxWebstorageModule } from 'ngx-webstorage';
import 'zone.js/dist/zone-patch-rxjs';

import { EditorModule as PeEditorModule } from '@pe/builder-editor/projects/modules/editor/src';
import { PebEditorModule } from '@pe/builder-editor/projects/modules/editor/src/editor.module';
import { PebElementsModule } from '@pe/builder-editor/projects/modules/elements/src/elements.module';
import { ViewerModule as PeViewerModule } from '@pe/builder-editor/projects/modules/viewer/src';
import { PebUiModule } from '@pe/builder-ui';
import { PeFeatureFlagModule } from '@pe/feature-flag';
import { FormModule as PeFormModule } from '@pe/ng-kit/modules/form';
import { I18nModule as PeI18nModule } from '@pe/ng-kit/modules/i18n';
import { MediaModule as PeMediaModule } from '@pe/ng-kit/modules/media';
import { TextEditorToolbarModule as PeTextEditorToolbarModule } from '@pe/ng-kit/modules/text-editor';
import { SharedModule } from '../shared/shared.module';
import { BuilderThemeApi } from './api/theme.api';
import { BuilderRoutingModule } from './builder.routing';
import { NavbarButtonCategoriesMenuComponent } from './components/navbar-button-categories-menu/navbar-button-categories-menu.component';
import { NavbarButtonIconsMenuComponent } from './components/navbar-button-menu/navbar-button-icons-menu/navbar-button-icons-menu.component';
import { NavbarButtonMenuComponent } from './components/navbar-button-menu/navbar-button-menu.component';
import { NavbarControlsButtonComponent } from './components/navbar-controls-button/navbar-controls-button.component';
import { NavbarPagesButtonComponent } from './components/navbar-pages-button/navbar-pages-button.component';
import { ScrollToolbarComponent } from './components/navbar-scroll-toolbar/scroll-toolbar.component';
import { NavbarSeparatorComponent } from './components/navbar-separator/navbar-separator.component';
import { NavbarSettingsSectionComponent } from './components/navbar-settings-section/navbar-settings-section.component';
import { NavbarSpacerComponent } from './components/navbar-spacer/navbar-spacer.component';
import { NavbarTopButtonComponent } from './components/navbar-top-button/navbar-top-button.component';
import { EditorScreenSelectComponent } from './editor/controls/editor-screen-select/editor-screen-select.component';
import { EditorScaleSelectComponent } from './editor/controls/editor-zoom-select/editor-scale-select.component';
import { ElementDeletableToggleComponent } from './editor/controls/element-deletable-toggle/element-deletable-toggle.component';
import { ElementKeepAspectToggleComponent } from './editor/controls/element-keep-aspect-toggle/element-keep-aspect-toggle.component';
import { ElementLinkHomeToggleComponent } from './editor/controls/element-link-home-toggle/element-link-home-toggle.component';
import { ElementPinnedToggleComponent } from './editor/controls/element-pinned-toggle/element-pinned-toggle.component';
import { ElementVisibilityToggleComponent } from './editor/controls/element-visibility-toggle/element-visibility-toggle.component';
import { NavbarButtonVisibilityMenuComponent } from './editor/controls/element-visibility-toggle/navbar-button-visibility-menu/navbar-button-visibility-menu.component';
import { SeoButtonComponent } from './editor/controls/seo-button/seo-button.component';
import { ThemePublishButtonComponent } from './editor/controls/theme-publish-button/theme-publish-button.component';
import { ThemeSaveButtonComponent } from './editor/controls/theme-save-button/theme-save-button.component';
import { ViewerToggleComponent } from './editor/controls/viewer-toggle/viewer-toggle.component';
import { PublishDialogComponent } from './editor/dialogs/publish-dialog/publish-dialog.component';
import { SeoDialogFormComponent } from './editor/dialogs/seo-dialog/seo-dialog-form/seo-dialog-form.component';
import { SeoDialogComponent } from './editor/dialogs/seo-dialog/seo-dialog.component';
import { NavbarControlsComponent } from './editor/navbars/controls/navbar-controls.component';
import { NavbarPagesComponent } from './editor/navbars/pages/navbar-pages.component';
import { NavbarTopComponent } from './editor/navbars/top/navbar-top.component';
import { AmountWidgetSettingsComponent } from './editor/panels/amount-settings/amount-settings.component';
import { ButtonWidgetSettingsComponent } from './editor/panels/button-settings/button-settings.component';
import { CarouselWidgetSettingsComponent } from './editor/panels/carousel-settings/carousel-settings.component';
import { NavbarCartIconSettingsComponent } from './editor/panels/cart-icon-settings/navbar-cart-icon-settings.component';
import { ImageWidgetSettingsComponent } from './editor/panels/image-settings/image-settings.component';
import { NavbarProductSettingsComponent } from './editor/panels/product-settings/navbar-product-settings.component';
import { SectionSettingsComponent } from './editor/panels/section-settings/section-settings.component';
import { NavbarShapeSettingsComponent } from './editor/panels/shape-settings/shape-settings.component';
import { TextWidgetSettingsComponent } from './editor/panels/text-settings/text-settings.component';
import { BuilderPageComponent } from './root/page.component';
import { BuilderThemeComponent } from './root/theme.component';
import { BlobUploadService } from './services/blob-upload.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BuilderRoutingModule,
    PebEditorModule,
    PebElementsModule,
    PebUiModule,
    PeFeatureFlagModule,

    MatToolbarModule,
    MatButtonModule,
    MatDividerModule,
    MatTableModule,
    MatMenuModule,
    MatCheckboxModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatIconModule,
    SharedModule,
    PeEditorModule,
    PeViewerModule,
    PeFormModule,
    PeTextEditorToolbarModule,
    PeI18nModule.forChild(),
    PeMediaModule.forRoot(),
    NgxWebstorageModule.forRoot({
      prefix: 'pe.common',
      separator: '.',
      caseSensitive: true,
    }),
  ],
  declarations: [
    BuilderThemeComponent,
    BuilderPageComponent,
    NavbarPagesComponent,
    NavbarTopComponent,
    NavbarControlsComponent,
    NavbarPagesButtonComponent,
    NavbarTopButtonComponent,
    NavbarControlsButtonComponent,
    NavbarSpacerComponent,
    NavbarButtonCategoriesMenuComponent,
    NavbarButtonIconsMenuComponent,
    NavbarButtonMenuComponent,
    NavbarButtonVisibilityMenuComponent,
    NavbarProductSettingsComponent,
    TextWidgetSettingsComponent,
    AmountWidgetSettingsComponent,
    ButtonWidgetSettingsComponent,
    NavbarSettingsSectionComponent,
    NavbarCartIconSettingsComponent,
    NavbarShapeSettingsComponent,
    ScrollToolbarComponent,
    EditorScreenSelectComponent,
    EditorScaleSelectComponent,
    ViewerToggleComponent,
    SectionSettingsComponent,
    ElementVisibilityToggleComponent,
    ElementPinnedToggleComponent,
    ElementKeepAspectToggleComponent,
    ElementLinkHomeToggleComponent,
    ElementDeletableToggleComponent,
    ThemeSaveButtonComponent,
    ThemePublishButtonComponent,
    PublishDialogComponent,
    SeoDialogComponent,
    SeoButtonComponent,
    SeoDialogFormComponent,
    NavbarSeparatorComponent,
    ImageWidgetSettingsComponent,
    CarouselWidgetSettingsComponent,
  ],
  providers: [
    BlobUploadService,
  ],
  entryComponents: [
    PublishDialogComponent,
    SeoDialogComponent,
  ],
})
export class BuilderModule {}
