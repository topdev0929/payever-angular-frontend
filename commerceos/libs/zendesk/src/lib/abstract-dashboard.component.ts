import { Injector, ChangeDetectorRef, OnInit, Type, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { DockerItemInterface } from '@pe/docker';
import { WallpaperService } from '@pe/wallpaper';

import { NgxZendeskWebwidgetService } from './ngx-zendesk-webwidget';

@Component({ template: '' })
export abstract class AbstractDashboardComponent implements OnInit {
  backgroundImage: string;
  dockerItems: DockerItemInterface[] = [];

  protected activatedRoute: ActivatedRoute = this.injector.get<ActivatedRoute>(ActivatedRoute as Type<ActivatedRoute>);
  protected changeDetectorRef: ChangeDetectorRef = this.injector.get<ChangeDetectorRef>(
    ChangeDetectorRef as Type<ChangeDetectorRef>,
  );

  protected ngxZendeskWebwidgetService: NgxZendeskWebwidgetService = this.injector.get(NgxZendeskWebwidgetService);

  protected wallpaperService: WallpaperService = this.injector.get<WallpaperService>(
    WallpaperService as Type<WallpaperService>,
  );

  constructor(
    protected injector: Injector
  ) {
  }

  ngOnInit(): void {
    if (this.activatedRoute.snapshot?.children[0]) {
      const infoBoxType: string = this.activatedRoute.snapshot.children[0].data['infoBox'];
      this.initDocker(infoBoxType);
    }
  }

  onDockerItemsChange(items: DockerItemInterface[]): void {
    this.dockerItems = items;
  }

  protected abstract initDocker(infoBox?: string): void;

  protected showChatButton(): void {
    this.ngxZendeskWebwidgetService.setLocale(localStorage.getItem('pe_current_locale'));
    this.ngxZendeskWebwidgetService.show();
  }

  protected hideChatButton(): void {
    this.ngxZendeskWebwidgetService.hide();
  }
}
