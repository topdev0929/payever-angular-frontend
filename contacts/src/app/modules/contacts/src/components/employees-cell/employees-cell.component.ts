import { Component, Inject, OnInit } from '@angular/core';

import { EnvironmentConfigInterface, PE_ENV } from '@pe/common';

@Component({
  selector: 'contacts-employees-cell',
  templateUrl: './employees-cell.component.html',
  styleUrls: ['./employees-cell.component.scss']
})
export class EmployeesCellComponent implements OnInit {

  item: any;

  get assetsPath(): string {
    return `${this.envConfig.custom.cdn}/placeholders`;
  }

  backgroundImage = `url(${this.assetsPath}/contact-icon-onblack.svg)`;

  constructor(
    @Inject(PE_ENV) private envConfig: EnvironmentConfigInterface,
  ) {
  }

  ngOnInit(): void {
  }

}
