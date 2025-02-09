import { Injectable, OnDestroy, SecurityContext } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';
import { DomSanitizer } from '@angular/platform-browser';

import { PeSubscriptionApi } from '../../../api/subscription/abstract.subscription.api';
import { PaginationCamelCase } from '../../../shared/interfaces/pagination.interface';
import { Order } from '../../../shared/interfaces/order.interface';
import { PesProgramDto } from '../dto/program.dto';
import { Direction } from '../../../shared/enums/direction.enum';
import { ProgramEntity } from '../../../api/subscription/subscription.api.interface';
import { PeProgramsSortEvent, programsSortOptions } from '../actions';
import { AbstractService } from '../../../shared/abstract';

export interface ProgramDataGridItem {
  program: PesProgramDto;
  selected: boolean;
  image: string;
}

@Injectable()
export class PesProgramsService extends AbstractService implements OnDestroy {
  private programsStream$ = new BehaviorSubject<ProgramEntity[]>([]);
  private loadingStream$ = new BehaviorSubject<boolean>(false);
  private searchStringStream$ = new BehaviorSubject<string>(null);
  private orderStream$ = new BehaviorSubject<Order>({
    by: 'createdAt',
    direction: Direction.DESC,
  });
  private paginationStream$ = new BehaviorSubject<PaginationCamelCase>({
    page: 1,
    pageCount: 1,
    perPage: 20,
    itemCount: 20,
  });

  programs$ = this.programsStream$.asObservable();
  loading$ = this.loadingStream$.asObservable();
  searchString$ = this.searchStringStream$.asObservable();
  order$ = this.orderStream$.asObservable();
  pagination$ = this.paginationStream$.asObservable();

  set programs(items: ProgramEntity[]) {
    this.programsStream$.next(items);
  }

  get programs(): ProgramEntity[] {
    return this.programsStream$.value;
  }

  set loading(value: boolean) {
    this.loadingStream$.next(value);
  }

  get loading(): boolean {
    return this.loadingStream$.value;
  }

  set searchString(value: string) {
    this.searchStringStream$.next(value);
  }

  get searchString(): string {
    return this.searchStringStream$.value;
  }

  set order(value: Order) {
    this.orderStream$.next(value);
  }

  get order(): Order {
    return this.orderStream$.value;
  }

  set pagination(value: PaginationCamelCase) {
    this.paginationStream$.next(value);
  }

  get pagination(): PaginationCamelCase {
    return this.paginationStream$.value;
  }

  get hasNextPage(): boolean {
    return this.pagination.page < this.pagination.pageCount;
  }

  constructor(private subscriptionApi: PeSubscriptionApi, private domSanitizer: DomSanitizer) {
    super();
  }

  loadPrograms(): Observable<ProgramEntity[]> {
    this.loading = true;
    return this.subscriptionApi.getAllPlans().pipe(
      tap((programs: any) => (this.programs = programs)),
      finalize(() => (this.loading = false)),
    );
  }

  loadNextPage() {
    if (this.hasNextPage) {
      this.patchPagination({
        page: this.pagination.page + 1,
      });
    }
  }

  toggleOrderByField(sortOption: PeProgramsSortEvent) {
    const { field, sort } = programsSortOptions[sortOption];

    const updatedDirection =
      sort ??
      (this.order.by === field
        ? this.order.direction === Direction.ASC
          ? Direction.DESC
          : Direction.ASC
        : Direction.DESC);

    this.order = {
      by: field,
      direction: updatedDirection,
    };
  }

  resetPrograms() {
    this.searchString = '';
    return this.loadPrograms();
  }

  patchPagination(value: Partial<PaginationCamelCase>) {
    this.pagination = {
      ...this.pagination,
      ...value,
    };
  }

  ngOnDestroy() {
    this.programsStream$.next([]);
    super.ngOnDestroy();
  }

  createListImageCanvas(letter: string) {
    const canvas = document.createElement('canvas');
    canvas.width = 50;
    canvas.height = 50;

    const ctx = canvas.getContext('2d');

    const grd = ctx.createLinearGradient(0, 0, 50, 50);
    grd.addColorStop(0, '#fe9f04');
    grd.addColorStop(1, '#fa7421');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, 50, 50);

    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'white';

    ctx.fillText(letter, 25, 30);
    const dataURI = canvas.toDataURL('image/png');

    return dataURI;
  }

  createListImage(letter: string) {
    // create SVG on the fly for programs without a image property

    const svg = `<svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
    <defs>
     <linearGradient y2="0" x2="0" y1="1" x1="0" id="svg_3">
      <stop offset="0" stop-color="#fa7421"/>
      <stop offset="1" stop-color="#058bde"/>
     </linearGradient>
    </defs>
    <g>
     <title>background</title>
     <rect fill="none" id="canvas_background" height="82" width="87" y="-1" x="-1"/>
     <g display="none" overflow="visible" y="0" x="0" height="100%" width="100%" id="canvasGrid">
      <rect fill="url(#gridpattern)" stroke-width="0" y="0" x="0" height="100%" width="100%"/>
     </g>
    </g>
    <g>
     <title>Layer 1</title>
     <path id="svg_4" d="m3,7c0,-2.17352 1.82648,-4 4,-4l72,0c2.17352,0 4,1.82648 4,4l0,67c0,2.17352 -1.82648,4 -4,4l-72,0c-2.17352,0 -4,-1.82648 -4,-4l0,-67z" stroke-opacity="null" stroke-linecap="null" stroke-linejoin="null" stroke-width="0" stroke="url(#svg_3)" fill-opacity="null" fill="#fe9f04"/>
    </g>
    <g>
      <text x="20" y="32" text-anchor="middle" font-family="Arial" font-size="30" fill="white">${letter}</text>
    </g>
   </svg>`;

    const svgDataURI = `'data:image/svg+xml;base64,'${window.btoa(svg)}`;
    const sanitizedURI = this.domSanitizer.sanitize(
      SecurityContext.URL,
      this.domSanitizer.bypassSecurityTrustUrl(svgDataURI),
    );
    return sanitizedURI;
  }
}
