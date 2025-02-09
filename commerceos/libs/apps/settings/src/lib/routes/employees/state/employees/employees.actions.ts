import { EmployeesGridItemInterface } from '../../interfaces/employees-grid-item.interface';

export namespace PeEmployeesActions {
  export class InitGridEmployees {
    static readonly type = '[Peb/Employees] Init Grid Employees';

    constructor(public allGridItems: EmployeesGridItemInterface[]) {}
  }

  export class PatchEmployee {
    static readonly type = '[Peb/Employees] Patch Employee';

    constructor(public updatedEmployee: EmployeesGridItemInterface) {}
  }

  export class FilteredEmployees {
    static readonly type = '[Peb/Employees] Set Filtered Employees';

    constructor(public filteredItems: EmployeesGridItemInterface[]) {}
  }

  export class AddEmployee {
    static readonly type = '[Peb/Employees] Add Employee';

    constructor(public newItem: EmployeesGridItemInterface) { }
  }

  export class AddEmployees {
    static readonly type = '[Peb/Employees] Add Employees';

    constructor(public allGridItems: EmployeesGridItemInterface[]) { }
  }

  export class DeleteEmployee {
    static readonly type = '[Peb/Employees] Delete Employee';

    constructor(public deletingId: string) { }
  }

  export class SortEmployees {
    static readonly type = '[Peb/Employees] Sorting Employees';

    constructor(public sortFn: (prev: EmployeesGridItemInterface, next: EmployeesGridItemInterface) => number) { }
  }
}

