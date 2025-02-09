import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { filter, take } from 'rxjs/operators';

import { cloneDeep } from 'lodash-es';
import { WindowService } from '../../../../kit/window';
import { SwiperService } from '../../../../kit/swiper';
import { DockerItemInterface } from '../docker.interface';

@Component({
  selector: 'pe-docker',
  templateUrl: 'docker.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DockerComponent {
  @Input() background: string;
  @Input() items: DockerItemInterface[];
  @Output() itemsChange: EventEmitter<DockerItemInterface[]> = new EventEmitter<DockerItemInterface[]>();
  swiper: Swiper;
  private swiperConfig: SwiperOptions;

  constructor(
    private swiperService: SwiperService,
    private windowService: WindowService) {}

  get isMobile$(): Observable<boolean> {
    return this.windowService.isMobile$.pipe(take(1), filter(item => !!item));
  }

  get screenWidth$(): Observable<number> {
    return this.windowService.width$;
  }

  ngAfterViewInit(): void {
   this.isMobile$.subscribe(() => {
      this.setUpSwiperConfigs();
    });
  }

  activateSwiper(): void {
    this.swiper = new Swiper('.swiper-container', this.swiperConfig);
  }

  setUpSwiperConfigs(): void {
    this.screenWidth$.subscribe(windowWidth => {
      this.swiperConfig = this.swiperService.getSwiperConfig(windowWidth);
      this.activateSwiper();
    });
  }

  onSelect(item: DockerItemInterface): void {
    item.onSelect(item.active);
    if (!item.active) {
      const itemsClone: DockerItemInterface[] = cloneDeep(this.items);
      itemsClone.forEach((cloneItem: DockerItemInterface) => cloneItem.active = false);
      const itemIndex: number = itemsClone.findIndex((cloneItem: DockerItemInterface) => cloneItem.title === item.title);
      itemsClone[itemIndex].active = !item.active;
      this.itemsChange.emit(itemsClone);
    }
  }
}
