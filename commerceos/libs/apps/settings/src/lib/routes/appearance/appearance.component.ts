import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Store, Select } from '@ngxs/store';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Observable } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { BusinessInterface } from '@pe/business';
import { AppThemeEnum, MessageBus, PeDestroyService, PeThemeInterface } from '@pe/common';
import { TranslateService } from '@pe/i18n-core';
import { loadStyles, removeStyle } from '@pe/lazy-styles-loader';
import { ListDataModel, RadioButtonComponent } from '@pe/ui';
import { BusinessState, UpdateBusinessData } from '@pe/user';

import { EditStyleComponent } from '../../components/edit-style/edit-style.component';
import { EnvironmentConfigService, InfoBoxService } from '../../services';

interface AppearanceItemType {
  theme: AppThemeEnum;
  image: string;
  text: string;
  isLoading: boolean;
}
@Component({
  selector: 'peb-appearance',
  templateUrl: './appearance.component.html',
  styleUrls: ['./appearance.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppearanceComponent implements OnInit {
  @SelectSnapshot(BusinessState.businessData) readonly businessData: BusinessInterface;
  @Select(BusinessState.loading) isLoading$: Observable<boolean>;
  @ViewChildren(RadioButtonComponent) radioElements: QueryList<RadioButtonComponent>;

  private currentTheme = AppThemeEnum.dark;
  public selectedTheme = AppThemeEnum.dark;
  isAuto = false;
  isLoading = false;
  form: FormGroup;
  readonly optionsList: ListDataModel[] = [
    {
      logo: '#icon-settings-general-styles',
      itemName: this.translateService.translate('info_boxes.panels.general.menu_list.color_and_style.title'),
      action: (e, detail) => {
        this.infoBoxService.openModal(
          this.infoBoxService.getObjectForModal(detail, EditStyleComponent, {
            themeSettings: this.businessData.themeSettings,
          }),
          this.onColorAndStyleChange.bind(this),
        );
      },
    },
  ];

  readonly appearanceItems: AppearanceItemType[] = Object.keys(AppThemeEnum)
    .map((key) => {
      const theme = AppThemeEnum[key];

      return {
        theme,
        image: `${this.configService.getCustomConfig().cdn}/images/installation/settings/${theme}.png`,
        text: this.translateService.translate(`info_boxes.panels.themes.theme_list.${theme}.title`),
        isLoading: false,
      };
    });

  constructor(
    private fb: FormBuilder,
    private infoBoxService: InfoBoxService,
    private translateService: TranslateService,
    private destroy$: PeDestroyService,
    private configService: EnvironmentConfigService,
    private store: Store,
    public messageBus: MessageBus,
    private cdRef: ChangeDetectorRef,
  ) {
    this.currentTheme = this.businessData?.themeSettings?.theme ?? AppThemeEnum.dark;
    this.isAuto = this.businessData?.themeSettings?.auto;
    this.form = this.fb.group({
      theme: [this.currentTheme],
    });
    this.form.valueChanges
      .pipe(
        tap((value) => {
          this.isAuto = false;
          this.changeThemeValue({ theme: value.theme, auto: this.isAuto });
        }),
        takeUntil(this.destroy$),
      )
      .subscribe();
  }

  ngOnInit(): void {
    this.isLoading$
      .pipe(
        tap((isLoading) => {
          this.isLoading = isLoading;
          if (!isLoading) {
            this.appearanceItems.forEach((item) => {
              item.isLoading = false;
            });
            this.selectedTheme = this.currentTheme;
            if (this.currentTheme === AppThemeEnum.dark) {
              removeStyle("pe-theme");
            }
            else {
              loadStyles([{ name: this.currentTheme, id: 'pe-theme' }]);
            }
          }
          this.cdRef.detectChanges();
        }),
        takeUntil(this.destroy$),
      )
      .subscribe();
  }

  applyAutomaticTheme(value: boolean) {
    this.isAuto = value;
    let themeToApply = this.currentTheme;
    if (value) {
      const { matchMedia } = window;
      const isSystemDark = matchMedia && matchMedia('(prefers-color-scheme: dark)').matches;
      themeToApply = isSystemDark ? AppThemeEnum.dark : AppThemeEnum.light;
    }
    this.changeThemeValue({ theme: themeToApply, auto: this.isAuto });
  }

  onColorAndStyleChange(data: any) {
    const { primaryColor, secondaryColor } = data.style;
    const { theme } = this.businessData.themeSettings;
    this.isAuto = false;
    const body = {
      primaryColor,
      secondaryColor,
      theme,
      auto: this.isAuto,
    };
    this.changeThemeValue(body);
  }

  private changeThemeValue(theme: PeThemeInterface) {
    this.currentTheme = theme.theme;
    this.appearanceItems.find((item: AppearanceItemType) => item.theme === this.currentTheme).isLoading = true;
    const body = { themeSettings: theme };
    const { _id } = this.businessData;

    this.store.dispatch(new UpdateBusinessData(_id, body));
  }

  handleItemClick(item: any): void {
    const associatedRadio = this.radioElements.toArray().find(radio => radio.value === item.theme);
    if (associatedRadio) {
      associatedRadio.inputViewChild.nativeElement.click();
    }
  }
}
