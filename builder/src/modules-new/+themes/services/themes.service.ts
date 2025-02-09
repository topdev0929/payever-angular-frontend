import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({ providedIn: 'root' })
export class ThemesService {
  loadNextThemesPage$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  themesCount$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
}
