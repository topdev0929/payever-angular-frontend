import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { PebCreateEmptyPageAction } from '@pe/builder/actions';
import { PebShape } from '@pe/builder/core';
import { PebPageListService } from '@pe/builder/page-list';
import { PebShapesService } from '@pe/builder/shapes';
import { PebInsertAction, PebShapesState } from '@pe/builder/state';


const INSERT_MENU_TAG = 'insert-menu';

@Component({
  selector: 'pe-builder-insert',
  templateUrl: './builder-insert.component.html',
  styleUrls: ['./builder-insert.component.scss'],
  providers: [PebPageListService],
})
export class PebShopBuilderInsertComponent {

  @Select(PebShapesState.shapes) shapes$!: Observable<PebShape[]>;

  menuShapes$ = this.shapes$.pipe(
    map(shapes => shapes.filter(shape => shape.tags.includes(INSERT_MENU_TAG))),
  );

  constructor(
    private dialogRef: MatDialogRef<PebShopBuilderInsertComponent>,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private shapeService: PebShapesService,
    private store: Store,
    private readonly pageListService: PebPageListService,
    ) {
  }

  onCloseClick() {
    this.close();
  }

  insertElements(shape: PebShape) {
    this.store.dispatch(new PebInsertAction(shape.elements, { selectInserted: true, sync: true }));
    this.close();
  }

  addNewPage() {
    this.store.dispatch(new PebCreateEmptyPageAction());
    this.close();
  }

  openComponentDialog() {
    this.router.navigate(['edit/insert'], { queryParamsHandling: 'merge', relativeTo: this.activatedRoute  });
    this.close();
  }

  close(){
    this.dialogRef.close();
  }
}
