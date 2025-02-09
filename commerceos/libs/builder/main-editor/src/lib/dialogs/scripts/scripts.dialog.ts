import { AfterViewInit, ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { PebEnvService, PebScript } from '@pe/builder/core';
import { PebPagesState, PebScriptsState, PebUpdateScriptsAction } from '@pe/builder/state';

import { EditorIcons } from '../../editor-icons';

import { PebEditorScriptFormDialog } from './script-form.dialog';

@Component({
  selector: 'peb-scripts',
  templateUrl: './scripts.dialog.html',
  styleUrls: ['./scripts.dialog.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebEditorScriptsDialog implements AfterViewInit {

  @Select(PebScriptsState.scriptList({ includeDeleted: false })) scripts$!: Observable<PebScript[]>;

  sections$: Observable<Array<{ id: string, name: string, scripts: PebScript[] }>> = this.scripts$.pipe(
    map((scripts) => {
      const pages = this.store.selectSnapshot(PebPagesState.pages);
      const globalScripts = { id: null, name: 'Global', scripts: [] };

      const sections = pages.reduce((acc, page) => {
        acc.push({ id: page.id, name: page.name, scripts: [] });

        return acc;
      }, [globalScripts]);

      scripts.forEach((script) => {
        const section = sections.find(section => section.id === script.page) ?? globalScripts;
        section.scripts.push(script);
      });

      return sections.filter(section => section.scripts.length);
    })
  );

  disableAnimation = true;

  constructor(
    private dialogRef: MatDialogRef<PebEditorScriptsDialog>,
    private store: Store,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private pebEnvService: PebEnvService,
    private dialog: MatDialog,
    iconRegistry: MatIconRegistry,
    domSanitizer: DomSanitizer,
  ) {
    Object.entries(EditorIcons).forEach(([name, path]) => {
      iconRegistry.addSvgIcon(
        name,
        domSanitizer.bypassSecurityTrustResourceUrl(`assets/icons/${path}`),
      );
    });
  }

  ngAfterViewInit(): void {
    // https://stackoverflow.com/questions/53518380/angular-7-material-expansion-panel-flicker/53691689
    setTimeout(() => this.disableAnimation = false);
  }

  openScript(script: PebScript = null) {
    this.dialog.open(PebEditorScriptFormDialog, {
      data: { script },
      panelClass: ['script-dialog__panel'],
      width: '436px',
      disableClose: true,
    });
  }

  toggleScript(script: PebScript): void {
    this.store.dispatch(new PebUpdateScriptsAction({ ...script, isEnable: !script.isEnable }));
  }

  close() {
    this.dialogRef.close(true);
  }

  trackById(index: number, item: any) {
    return item?.id;
  }
}
