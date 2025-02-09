import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'pe-invoice-edit',
  templateUrl: './invoice-edit.component.html',
  styleUrls: ['./invoice-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PeInvoiceEditComponent implements OnInit {

  ngOnInit(): void {
  }

}
