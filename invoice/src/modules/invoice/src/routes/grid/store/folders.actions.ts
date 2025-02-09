export class InitLoadInvoiceFolders {
  static readonly type = '[Invoice/API] Init Invoice Load Folders';
  constructor(public data: any, public group: boolean) { }
}
export class InitLoadCurrencies {
  static readonly type = '[Invoice/API] Init Invoice Load currencies';
  constructor(public data: any) { }
}
export class InitLoadLanguages {
  static readonly type = '[Invoice/API] Init Invoice Load languages';
  constructor(public data: any) { }
}

export class FilterInvoiceStore {
  static readonly type = '[Invoice/API] Filtering Invoice Store';
  constructor(public field: string = '', public value: any = '') { }
}

export class FilterStore {
  static readonly type = '[Invoice/API] Filter value Store';
  constructor(public field: any[]) { }
}

export class OrderStore {
  static readonly type = '[Invoice/API] Order value Store';
  constructor(public order: string = 'asc') { }
}

export class UpsertItem {
  static readonly type = '[Invoice/API] Add Invoice';
  constructor(public item: any) { }
}

export class DeleteInvoices {
  static readonly type = '[Invoice/API] Delete Invoices';
  constructor(public items: string[]) { }
}
