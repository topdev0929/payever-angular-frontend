import { Component } from '@angular/core';

@Component({
  selector: 'doc-dropdowns',
  templateUrl: 'dropdowns-doc.component.html'
})
export class DropdownsDocComponent {
  exampleDropdown1: string = `
<div class="dropdown btn-group">
    <button class="btn btn-default dropdown-toggle" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
        Dropdown base style
        <svg class="icon icon-16"><use xlink:href="#icon-arrow-down-small-16" /></svg>
    </button>
    <div class="dropdown-menu" aria-labelledby="dropdownMenu1" role="menu">
        <ul>
            <li role="menuitem"><a class="dropdown-item" href="#">Action</a></li>
            <li role="menuitem"><a class="dropdown-item" href="#">Another action</a></li>
            <li role="menuitem"><a class="dropdown-item" href="#">Something else here</a></li>
        </ul>
    </div>
</div>

<div class="dropdown btn-group pull-right">
    <button class="btn btn-primary btn-link dropdown-toggle" type="button" id="dropdownMenu2" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
        Pulled right
        <svg class="icon icon-16"><use xlink:href="#icon-arrow-down-small-16" /></svg>
    </button>
    <div class="dropdown-menu" aria-labelledby="dropdownMenu2" role="menu">
        <ul>
            <li role="menuitem"><a class="dropdown-item" href="#">Action</a></li>
            <li role="menuitem"><a class="dropdown-item" href="#">Another action</a></li>
            <li role="menuitem"><a class="dropdown-item" href="#">Something else here</a></li>
            <li class="divider dropdown-divider"></li>
            <li role="menuitem"><a class="dropdown-item" href="#">Separated link</a></li>
        </ul>
    </div>
</div>`;

  exampleDropdown2: string = `
<div class="dropdown btn-group dropdown-alternate">
    <button class="btn btn-default dropdown-toggle" type="button" id="dropdownMenu3" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
        Dropdown alternate style
        <svg class="icon icon-16"><use xlink:href="#icon-arrow-down-small-16" /></svg>
    </button>
    <div class="dropdown-menu" aria-labelledby="dropdownMenu3" role="menu">
        <ul>
            <li role="menuitem"><a class="dropdown-item" href="#">Action</a></li>
            <li role="menuitem"><a class="dropdown-item" href="#">Another action</a></li>
            <li role="menuitem"><a class="dropdown-item" href="#">Something else here</a></li>
            <li role="menuitem"><a class="dropdown-item" href="#">Separated link</a></li>
        </ul>
    </div>
</div>`;

  exampleDropdown3: string = `
<div class="btn-group dropdown-alternate" dropdown [dropup]="true">
    <button dropdownToggle type="button" class="btn btn-default dropdown-toggle">
        Dropup
        <svg class="icon icon-16"><use xlink:href="#icon-arrow-down-small-16" /></svg>
    </button>
    <div *dropdownMenu class="dropdown-menu" role="menu">
        <ul>
            <li role="menuitem"><a class="dropdown-item" href="#">Action</a></li>
            <li role="menuitem"><a class="dropdown-item" href="#">Another action</a></li>
            <li role="menuitem"><a class="dropdown-item" href="#">Something else here</a></li>
            <li role="menuitem"><a class="dropdown-item" href="#">Separated link</a></li>
        </ul>
    </div>
</div>`;

  exampleDropdown4: string = `
<div class="btn-group dropdown-alternate dropup">
    <button class="btn btn-default dropdown-toggle" type="button" id="dropdownMenu4" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
        Dropup
        <svg class="icon icon-16"><use xlink:href="#icon-arrow-down-small-16" /></svg>
    </button>
    <div class="dropdown-menu" aria-labelledby="dropdownMenu4" role="menu">
        <ul>
            <li role="menuitem"><a class="dropdown-item" href="#">Action</a></li>
            <li role="menuitem"><a class="dropdown-item" href="#">Another action</a></li>
            <li role="menuitem"><a class="dropdown-item" href="#">Something else here</a></li>
            <li role="menuitem"><a class="dropdown-item" href="#">Separated link</a></li>
        </ul>
    </div>
</div>`;

}
