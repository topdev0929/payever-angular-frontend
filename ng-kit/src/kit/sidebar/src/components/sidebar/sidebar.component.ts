import {
  Component,
  Input,
  AfterContentInit,
  EventEmitter,
  Output,
  Renderer2,
  OnInit, ElementRef, ViewChild
} from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { Observable } from 'rxjs';

import {
  Dimensions,
  SidebarConfig,
  sidebarDefaultConfig,
  SidebarClasses,
  sidebarClassName
} from '../../sidebar.config';
import { peVariables, PeVariablesInterface } from '../../../../pe-variables';
import { ElementScrollPercentage, WindowService } from '../../../../window/src/services';
import { AbstractComponent } from '../../../../common/src/components';

@Component({
  selector: 'pe-sidebar',
  styleUrls: ['sidebar.component.scss'],
  templateUrl: 'sidebar.component.html',
})

export class SidebarComponent extends AbstractComponent implements AfterContentInit, OnInit {
  @ViewChild('scrollElement', { static: true }) scrollElement: ElementRef;

  @Input() classes: SidebarClasses = {};
  @Input()
  set configuration(configuration: SidebarConfig)  {
    for (const key in configuration) {
      if (configuration[key] !== undefined) {
        this.configurationInternal[key] = configuration[key];
      }
    }

    if (configuration.position) {
      this.classes.position = `${sidebarClassName}-${configuration.position}`;
    }
    if (configuration.style) {
      this.classes.style = `${sidebarClassName}-${configuration.style}`;
    }

    this.hide();
  }
  get configuration(): SidebarConfig {
    return this.configurationInternal;
  }

  @Input()
  set isOpen(isOpen: boolean) {
    if (isOpen && this.configurationInternal.style === 'transparent') {
      this.classes['first-open'] = true;
    }

    this.classes['in'] = isOpen;
    if (isOpen) {
      this.marginRight = '0';
    } else {
      this.hide();
    }

    this.setClasses();
  }
  get isOpen(): boolean {
    return this.classes['in'];
  }

  @Output() onSidebarOpened: EventEmitter<void> = new EventEmitter<void>();
  @Output() onSidebarClosed: EventEmitter<void> = new EventEmitter<void>();
  @Output() scrollEmitter: EventEmitter<number> = new EventEmitter<number>();

  classesString: string = sidebarClassName;
  configurationInternal: SidebarConfig = {};
  windowResizeListenFunc: Function;

  windowDimensions: Dimensions;
  peVariables: PeVariablesInterface = peVariables;
  sidebarWidth: number;
  vGridHeight: number;
  marginRight: string;

  isMobile$: Observable<boolean> = this.windowService.isMobile$;

  constructor(public renderer: Renderer2,
              private elementScrollPercentage: ElementScrollPercentage,
              private windowService: WindowService) {
    super();
  }

  ngOnInit(): void {
    this.elementScrollPercentage
      .getScrollAsStream(this.scrollElement.nativeElement) // Defaults to Document if no Element supplied.
      .pipe(takeUntil(this.destroyed$)).subscribe(
      (percent: number): void => {
        this.scrollEmitter.emit(percent);
      });
    this.isMobile$.pipe(takeUntil(this.destroyed$)).subscribe((isMobile: boolean) => {
      this.sidebarWidth = isMobile ? '100%' : this.peVariables.toNumber('sidebar_width_extra_large');
      this.configuration.width = isMobile ? '100%': this.configuration.width;
      this.hide();
    })
    this.vGridHeight = this.peVariables.toNumber('pe_vgrid_height');
  }

  ngAfterContentInit(): void {
    for (const key in sidebarDefaultConfig) {
      if (this.configurationInternal[key] === undefined) {
        this.configurationInternal[key] = sidebarDefaultConfig[key];
      }
    }

    this.classes.position = `${sidebarClassName}-${this.configurationInternal.position}`;
    this.classes.style = `${sidebarClassName}-${this.configurationInternal.style}`;
    this.setClasses();

    if (this.configurationInternal.style === 'transparent') {
      this.calculateDimensions();
    }
  }

  toggleSidebar(): void {
    if (this.classes['in']) {
      this.closeSidebar();
    } else {
      this.openSidebar();
    }
  }

  openSidebar(): void {
    this.classes['in'] = true;
    this.setClasses();
    this.onSidebarOpened.emit();
  }

  handleOutsideContentClick(event: MouseEvent): void {
    if (this.configurationInternal.style === 'transparent' && this.classes['in'] && (event.target as HTMLElement).classList.contains('scroll-container')) {
      this.closeSidebar();
    }
  }

  closeSidebar(): void {
    this.classes['in'] = false;
    this.setClasses();
    this.onSidebarClosed.emit();
  }

  setClasses(): void {
    const classesArray: string[] = [sidebarClassName];
    for (const key in this.classes) {
      if (typeof this.classes[key] === 'boolean') {
        if (this.classes[key]) {
          classesArray.push(key);
        }
      } else {
        classesArray.push(this.classes[key]);
      }
    }
    this.classesString = classesArray.join(' ');
  }

  hide(): void {
    this.marginRight = '-' + this.configuration.width;
  }

  private calculateDimensions(): void {
    this.windowDimensions = {
      width: window.innerWidth,
      height: window.innerHeight
    };
  }
}
