import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { switchMap, takeUntil, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { HttpEventType } from '@angular/common/http';

import { PebBlogsApi, PebEditorApi } from '@pe/builder-api';
import { PeOverlayWidgetService, PE_OVERLAY_CONFIG, PE_OVERLAY_DATA } from '@pe/overlay-widget';
import { PebEnvService, PebShopContainer } from '@pe/builder-core';
import { PeDestroyService } from '@pe/common';

@Component({
  selector: 'peb-create-app',
  templateUrl: './create-app.component.html',
  styleUrls: ['./create-app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PeSettingsCreateAppComponent implements OnInit {
  blogId: string;
  errorMsg: string;
  isImageLoading: boolean;

  blogConfig = {
    image: '',
    author: '',
    title: '',
    content: '',
  }

  constructor(

    private apiBlog: PebBlogsApi,
    @Inject(PE_OVERLAY_DATA) public appData: any,
    @Inject(PE_OVERLAY_CONFIG) public config: any,
    private overlay: PeOverlayWidgetService,
    private env: PebEnvService,
    private cdr: ChangeDetectorRef,
    private api: PebEditorApi,
    private destroy$: PeDestroyService,
  ) {
    if (this.appData._id) {
      this.config.doneBtnTitle = 'Open';
      this.config.title = this.appData.name;
      this.blogConfig.title = this.appData.title;
      this.blogConfig.content = this.appData.content;
      this.blogId = this.appData._id;
      this.config.doneBtnCallback = () => {
        const paylod: {
          author: string,
          title: string,
          content: string,
        } = null;
        if (this.blogConfig.title !== this.appData.title) {
          paylod.title = this.blogConfig.title;
        }
        if (this.blogConfig.content !== this.appData.content) {
          paylod.content = this.blogConfig.content;
        }
        if (!this.errorMsg) {
          if (!paylod.title && !paylod.content) {
            this.appData.isDefault ?
              this.openDashboard(this.appData) :
              this.apiBlog.markBlogAsDefault(this.appData._id).subscribe(data => {
                this.openDashboard(data);
              })
          }
          else {
            this.apiBlog.updateBlog(paylod).pipe(
              switchMap(shop => {
                return this.appData.isDefault ?
                  of(this.openDashboard(shop)) :
                  this.apiBlog.markBlogAsDefault(this.appData._id)
                    .pipe(tap((data) => this.openDashboard(data)))
              }),
            ).subscribe(data => { }, error => {
              this.errorMsg = error.error.errors;
              this.cdr.markForCheck();
            })
          }
        }
      }
      return;
    }
    this.config.doneBtnTitle = 'Create';
    this.config.doneBtnCallback = () => {
      const payload: { image: string, author: string, title: string, content: string } = this.blogConfig;
      if (!this.errorMsg) {
        this.apiBlog.createBlog(payload).pipe(
          switchMap(data => {
            this.appData._id = data._id;
            return this.apiBlog.markBlogAsDefault(data._id);
          }),
          tap(data => {
            this.openDashboard(data);
          }),
        ).subscribe()
      }
    }
  }

  ngOnInit() {
  }

  openDashboard(blog) {
    this.env.shopId = this.appData._id;
    this.appData.onSved$.next({ openBlog: true, blog });
    this.overlay.close();
  }

  validateShop(value) {
    this.blogConfig.title = value;
    if (!this.validateName(value)) {
      this.errorMsg = value.length < 3 ? 'Name should have at least 3 characters' : 'Name is not correct';
      this.cdr.markForCheck();
      return;
    }
    this.apiBlog.validateBlogName(value).subscribe(data => {
      this.errorMsg = data.message ? data.message : null;
      this.cdr.markForCheck();
    })
  }

  validateName(name: string) {
    return /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]$/.test(name);
  }

  removeBlog() {
    this.apiBlog.deleteBlog(this.appData._id).subscribe(data => {
      this.appData.onSved$.next({ updateBlogList: true });
      this.overlay.close();
    })
  }

  onLogoUpload($event: any) {
    this.isImageLoading = true;
    const files = $event;
    if (files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = () => {
        this.api.uploadImageWithProgress(PebShopContainer.Images, file).pipe(
          takeUntil(this.destroy$),
          tap((event) => {
            switch (event.type) {
              case HttpEventType.UploadProgress: {
                this.cdr.detectChanges();
                break;
              }
              case HttpEventType.Response: {
                this.blogConfig.image = (event?.body?.blobName || reader.result as string);
                this.isImageLoading = false;
                this.cdr.detectChanges();
                break;
              }
              default:
                break;
            }
          }),
        ).subscribe();
      };
    }
  }

}
