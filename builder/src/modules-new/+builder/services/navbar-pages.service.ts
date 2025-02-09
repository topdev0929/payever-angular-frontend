import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { NavbarPageInterface } from '../entities/navbar';

@Injectable({ providedIn: 'root' })
export class NavbarPagesService {
  private pagesSubject$ = new BehaviorSubject<NavbarPageInterface[]>([]);
  private activePageSubject$ = new BehaviorSubject<NavbarPageInterface>(null);

  // public buildPages(pages: PebElement[]): void {
  //   this.pagesSubject$.next(
  //     pages.map(({ data: { name }, uuid }: PebElement) => ({ label: name, uuid }))
  //   );
  // }

  // public setActivePageFromDocument(document: PebDocument): void {
  //   this.activePageSubject$.next({
  //     label: document.data.name,
  //     uuid: document.uuid,
  //   });
  // }

  get pages$(): Observable<NavbarPageInterface[]> {
    return this.pagesSubject$.asObservable();
  }

  get activePage$(): Observable<NavbarPageInterface> {
    return this.activePageSubject$.asObservable();
  }

  get activePage(): NavbarPageInterface {
    return this.activePageSubject$.getValue();
  }

  get pagesList(): NavbarPageInterface[] {
    return this.pagesSubject$.getValue();
  }
}
