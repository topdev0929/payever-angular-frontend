import { Component } from '@angular/core';

@Component({
  selector: 'doc-tabs',
  templateUrl: 'tabs-doc.component.html'
})
export class TabsDocComponent {

  exampleTabs: string = `
<tabset>
  <tab heading='One'>Content one</tab>
  <tab heading='Two'>Content two</tab>
  <tab heading='Three'>Content three</tab>
</tabset>`;

  examplePills: string = `
<tabset type='pills'>
  <tab heading='One'>Content one</tab>
  <tab heading='Two'>Content two</tab>
  <tab heading='Three'>Content three</tab>
</tabset>`;

  exampleStacked: string = `
<tabset [vertical]="true">
  <tab heading="Vertical 1">Vertical content 1</tab>
  <tab heading="Vertical 2">Vertical content 2</tab>
</tabset>`;

    exampleUnited: string = `
<tabset type="pills" [class.united]="true">
    <tab (select)="onSelect()">
        <ng-template tabHeading>
            <svg class="icon icon-16"><use xlink:href="#icon-grid-16"></use></svg>
        </ng-template>
        Content one
    </tab>
    <tab [active]="true">
        <ng-template tabHeading>
            <svg class="icon icon-16"><use xlink:href="#icon-main-16"></use></svg>
        </ng-template>
        Content two
    </tab>
    <tab>
        <ng-template tabHeading>
            <svg class="icon icon-16"><use xlink:href="#icon-barcode-16"></use></svg>
        </ng-template>
        Content three
    </tab>
</tabset>`;

  onSelect(): void {
    alert('Selected');
  }

}
