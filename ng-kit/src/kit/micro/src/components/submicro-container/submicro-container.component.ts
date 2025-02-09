import { ChangeDetectionStrategy, Component, ViewChild, ElementRef, HostBinding, ChangeDetectorRef, Input } from '@angular/core';
import { ActivatedRoute, Data } from '@angular/router';
import { take, takeUntil } from 'rxjs/operators';

import { AbstractComponent, PlatformService } from '../../../../common';
import { MicroLoaderService } from '../../services/micro-loader.service';
import { MicroRegistryService } from '../../services/micro-registry.service';
import { MicroAppInterface } from '../../types';

@Component({
  selector: 'pe-submicro-container',
  templateUrl: 'submicro-container.component.html',
  styleUrls: ['submicro-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SubmicroContainerComponent extends AbstractComponent {

  @Input() @HostBinding('class.full-screen') fullScreen: boolean = false;
  @Input() handleCloseEvents: boolean = true;
  @Input() submicro: string;

  @HostBinding('class.hidden') hidden: boolean = false;
  @ViewChild('micro', { static: true }) microContainer: ElementRef<HTMLElement>;

  constructor(private activatedRoute: ActivatedRoute,
              private chRef: ChangeDetectorRef,
              private microLoaderService: MicroLoaderService,
              private microRegistryService: MicroRegistryService,
              private platformService: PlatformService
  ) {
    super();
  }

  ngOnInit(): void {
    this.activatedRoute.data.pipe(take(1)).subscribe((data: Data) => {
      let submicro: string = data['submicro'] || this.submicro;
      if (!submicro) {
        const urlSegments: string[] = location.pathname.split('/');
        submicro = urlSegments[urlSegments.length - 1];
      }

      if (submicro) {
        const config: MicroAppInterface = this.microRegistryService.getMicroConfig(submicro) as MicroAppInterface;
        if (config) {
          this.microContainer.nativeElement.innerHTML = config.tag;

          if (this.microLoaderService.isScriptLoadedbyCode(config.code)) {
            window.dispatchEvent(new CustomEvent(`pe-run-${config.code}`, {}));
          } else {
            this.microRegistryService.loadBuild(config).subscribe(() => {
              window.dispatchEvent(new CustomEvent(`pe-run-${config.code}`, {}));
            });
          }
        } else {
          console.error('Not possible to find config for submicro');
        }
      } else {
        console.error('Micro code not provided for SubmicroContainer');
      }

      if (data['fullScreen']) {
        this.fullScreen = true;
      }
    });

    if (this.handleCloseEvents) {
      this.platformService.submicroClose$.pipe(takeUntil(this.destroyed$)).subscribe(() => {
        this.hidden = true;
        this.chRef.detectChanges();
      });
    }
  }
}
