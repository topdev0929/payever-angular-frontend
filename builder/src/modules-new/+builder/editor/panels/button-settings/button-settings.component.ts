import { AfterViewInit, ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Validators } from '@angular/forms';

import { PebElementType } from '@pe/builder-core';
import { parseUrl } from '@pe/builder-editor/projects/modules/editor/src/utils';
import { ButtonElementTypes } from '@pe/builder-editor/projects/modules/elements/src';
import { ButtonElementComponent } from '@pe/builder-editor/projects/modules/elements/src/basic/button-component/button.component';
import { isValidURL } from '@pe/builder-text-editor-compat';
import {
  CheckboxLabelPosition,
  CheckboxSize,
  ColorPickerFormat,
  ErrorBag,
  FormSchemeField,
  InputChangeEvent,
  InputType,
} from '@pe/ng-kit/modules/form';
import { LinksInterface } from '@pe/ng-kit/modules/text-editor';
import { ButtonWidgetSettingsInterface } from '../../../entities/navbar';
import { BaseButtonWidgetSettingsComponent } from '../base-button-settings/base-button-settings.component';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'pe-builder-button-settings',
  templateUrl: '../base-button-settings/base-button-settings.component.html',
  styleUrls: ['../base-button-settings/base-button-settings.component.scss'],
  providers: [ErrorBag],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonWidgetSettingsComponent
  extends BaseButtonWidgetSettingsComponent<ButtonWidgetSettingsInterface> implements AfterViewInit {

  @Input() pageRoutes: LinksInterface[];

  builderElement: PebElementType = PebElementType.Button;

  hasPagesBlock = true;
  hrefFieldset: FormSchemeField[];
  openInNewTabFieldset: FormSchemeField[];
  component: ButtonElementComponent;

  // FIXME rewrite it. Dont use getter
  get currentPageName(): string {
    let title: string = this.translateService.translate('content_editor.base_widget_settings.link_to');
    if (this.component.type === ButtonElementTypes.Button) {
      const routeIds: string | string[] = this.form.get('routeIds').value;
      if (routeIds) {
        if (typeof routeIds === 'string') {
          const page: LinksInterface = this.pageRoutes.find((p: LinksInterface) => p.id === routeIds) || null;
          title = page ? page.title : title;
        } else if (Array.isArray(routeIds) && routeIds.length) {
          const page: LinksInterface = this.pageRoutes.find((p: LinksInterface) => p.id === routeIds[0]) || null;
          title = page ? page.title : title;
        }
      } else if (this.form.get('href').value) {
        title = this.translateService.translate('content_editor.base_widget_settings.custom_link');
      }
    }

    return title;
  }

  isActiveLink(page: LinksInterface): boolean {
    const ids: string[] = this.form.get('routeIds').value || [];

    return ids.includes(page.id);
  }

  setCurrentPage(link: LinksInterface): void {
    const isDropdown = this.component.element.data.type === ButtonElementTypes.DropDown;

    let routeIds: string[] = this.form.get('routeIds').value || [];
    if (routeIds.includes(link.id)) {
      routeIds = routeIds.filter((id: string) => id !== link.id);
    } else if (isDropdown) {
      routeIds.push(link.id);
    } else {
      routeIds = [link.id];
    }

    this.updateData(
      isDropdown
        ? { data: { links: getAvailableRouteIds(this.pageRoutes, routeIds) } }
        : { data: { link: link.id } },
    );
    this.form.get('routeIds').setValue(routeIds);
  }

  getInitialData(): ButtonWidgetSettingsInterface {
    return {
      routeIds:
        this.component.element.data.type === ButtonElementTypes.DropDown
          ? ((this.component.element.data.links || []) as LinksInterface[]).map(i => i.id)
          : this.component.element.data.link,
      href: this.component && this.component.element.data && this.component.element.data.customLink,
      styles: this.getInitialStyleData(),
    };
  }

  protected createForm(initialData: ButtonWidgetSettingsInterface): void {
    if (!this.component) {
      return;
    }

    const data = this.getInitialData();
    this.form = this.formBuilder.group({
      href: [data.href],
      systemAction: [data.systemAction],
      openInNewTab: [data.openInNewTab],
      routeIds: [data.routeIds, Validators.required],
      styles: this.formBuilder.group({
        fontWeight: [data.styles.fontWeight],
        fontSize: [data.styles.fontSize],
        textColor: [data.styles.textColor],
        textHoverColor: [data.styles.textHoverColor],
        backgroundColor: [data.styles.backgroundColor],
        borderColor: [data.styles.borderColor],
        hoverColor: [data.styles.hoverColor],
        borderRadius: [data.styles.borderRadius],
        borderWidth: [data.styles.borderWidth],
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
              onValueChange: (event: InputChangeEvent): void => {
                let url: string = event.value as string;
                if (!isValidURL(url)) {
                  this.updateData({ data: { customLink: null, link: null } });
                  this.form.get('routeIds').setValue(null);
                } else {
                  url = parseUrl(url);
                  const isDropdown = this.component.type === ButtonElementTypes.DropDown;
                  if (!isDropdown) {
                    this.updateData({ data: { customLink: url, link: null } });
                    this.form.get('routeIds').setValue(null);
                  } else {
                    this.updateData({ data: { customLink: url } });
                  }
                }
              },
            },
          },
        ],
        openInNewTabFieldset: [
          {
            name: 'openInNewTab',
            type: 'checkbox',
            fieldSettings: {
              classList: 'col-xs-12',
              label: this.translateService.translate('content_editor.base_widget_settings.open_in_new_tab'),
            },
            checkboxSettings: {
              size: CheckboxSize.Small,
              labelPosition: CheckboxLabelPosition.Before,
            },
          },
        ],
        ...this.getBaseFormScheme(),
      },
    };

    this.hrefFieldset = this.formScheme.fieldsets.hrefFieldset;
    this.openInNewTabFieldset = this.formScheme.fieldsets.openInNewTabFieldset;
    this.textStylesFieldset = this.formScheme.fieldsets.textStylesFieldset;
    this.colorFieldset = this.formScheme.fieldsets.colorFieldset;
    this.cornersFieldset = this.formScheme.fieldsets.cornersFieldset;
    this.borderWidthFieldset = this.formScheme.fieldsets.borderWidthFieldset;

    this.changeDetectorRef.detectChanges();
  }
}

function getAvailableRouteIds(pageRoutes: LinksInterface[], routeIds: string[]): { id: string }[] {
  return pageRoutes
    .filter((link: LinksInterface) => routeIds.includes(link.id))
    .map((link: LinksInterface) => ({ id: link.id }));
}
