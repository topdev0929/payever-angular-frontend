import { Component } from '@angular/core';

@Component({
  selector: 'doc-layout-tabset',
  templateUrl: 'layout-tabset-doc.component.html'
})

export class LayoutTabsetDocComponent {
  backgroundImage: string = require('../../../assets/img/background_jpg_ed4f73.jpg');
  salesIcon: string = require('../../../assets/img/sales-app.png');
  adwordsIcon: string = require('../../../assets/img/adwords.png');
  facebookIcon: string = require('../../../assets/img/facebook-icon.png');
  contactsIcon: string = require('../../../assets/img/contacts.png');

  html1: string = `
    <pe-layout-app
      [backgroundImageUrl]="backgroundImage"
      noPadding="true"
      noHeaderBorder="true"
      >

      <pe-layout-header header [notTransparent]="true">
        ...
      </pe-layout-header>

      <!-- transclusion inside layout-app -->
      <pe-layout-tabset>
        <pe-layout-tab
          link="/layout-content"
          svgIcon="#icon-settings-builtin-applications">
        </pe-layout-tab>
        ...
      </pe-layout-tabset>
    </pe-layout-app>
  `;

  html2: string = `
<pe-layout-content>
  <h3>Here goes a transcluded content</h3>
  <p>...</p>
  <pe-layout-sidebar sidebar>
    <h4 class="text-center">Audience</h4>

    <form class="form-table">
        <p class="caption-2">Location</p>
        <fieldset>
          <div class="clearfix">
            <div class="row">
              <div class="col-xs-12">
                  <input class="form-control" id="exampleInputFirst" placeholder="Country, City or ZIP code" type="email">
                  <label>Country, City or ZIP code</label>
              </div>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <div class="clearfix">

            <div class="col-xs-6">
              <select class="form-control" id="ft06" placeholder="Select field" tabindex="8">
                  <option value="">Select field</option>
                  <option>1</option>
                  <option>2</option>
                  <option>3</option>
                  <option>4</option>
              </select>
              <label for="ft06">Select field</label>
            </div>
            <div class="col-xs-6">
              <select class="form-control" id="ft06" placeholder="Select field" tabindex="8">
                  <option value="">Select field</option>
                  <option>1</option>
                  <option>2</option>
                  <option>3</option>
                  <option>4</option>
              </select>
              <label for="ft06">Select field</label>
            </div>

          </div>
        </fieldset>
    </form>

    <h4 class="text-center">Edit Ad</h4>
    <form class="form-table">
        <fieldset>
          <div class="clearfix">

            <div class="row">
              <div class="col-xs-12">
                <textarea class="form-control" id="ft11" placeholder="Textarea field" rows="3" tabindex="13"></textarea>
                <label for="ft11">Textarea field</label>
              </div>

              <div class="col-xs-12">
                  <input class="form-control" id="exampleInputFirst" placeholder="Title" type="email">
                  <label>Title</label>
              </div>

              <div class="col-xs-12">
                <textarea class="form-control" id="ft11" placeholder="Textarea field" rows="3" tabindex="13"></textarea>
                <label for="ft11">Textarea field</label>
              </div>
            </div>

          </div>
        </fieldset>
    </form>

    <h4 class="text-center">Customers</h4>
    <ul class="nav nav-sidebar-blocks">
      <li>
        <a class="row" href="#">
          <span class="col-xs-10">Edit Ad</span>
          <span class="col-xs-2 text-center"><svg class="icon icon-16"><use xlink:href="#icon-arrow-right-2-16"></use></svg></span>
        </a>
      </li>
    </ul>

    <ul class="nav nav-sidebar-blocks">
      <li class="title caption-2">Content</li>
      <li>
        <a class="row" href="#">
          <span class="col-xs-6">Price</span>
          <span class="col-xs-4 text-right text-secondary">$699</span>
          <span class="col-xs-2 text-center"><svg class="icon icon-16"><use xlink:href="#icon-arrow-right-2-16"></use></svg></span>
        </a>
      </li>
      <li>
        <a class="row" href="#">
          <span class="col-xs-10">Audience</span>
          <span class="col-xs-2 text-center"><svg class="icon icon-16"><use xlink:href="#icon-plus-16"></use></svg></span>
        </a>
        <dl class="dl-horizontal">
          <dt>Gender</dt>
          <dd>Woman</dd>
          <dt>Age</dt>
          <dd>24 to 65+</dd>
          <dt>Interests</dt>
          <dd>Furniture Home & Deco Gadgets</dd>
        </dl>
      </li>
      <li>
        <a class="row" href="#">
          <span class="col-xs-6">Inventory SKU</span>
          <span class="col-xs-4 text-right text-secondary">3</span>
          <span class="col-xs-2 text-center"><svg class="icon icon-16"><use xlink:href="#icon-arrow-right-2-16"></use></svg></span>
        </a>
      </li>
      <li>
        <a class="row" href="#">
          <span class="col-xs-6">Selling channels</span>
          <span class="col-xs-4 text-right text-secondary">3</span>
          <span class="col-xs-2 text-center"><svg class="icon icon-16"><use xlink:href="#icon-arrow-right-2-16"></use></svg></span>
        </a>
      </li>
    </ul>
    <p class="small">Create your first Ad to skyrocket your product sales on your Shop.</p>

    <ul class="nav nav-sidebar-blocks">
      <li class="title caption-2">Products & Contents</li>
      <li>
        <a class="row" href="#">
          <span class="col-xs-1"><svg class="icon icon-24"><use xlink:href="#icon-dots-v-24"></use></svg></span>
          <span class="col-xs-9">Dock for Apple Watch</span>
          <span class="col-xs-2 text-center"><svg class="icon icon-16"><use xlink:href="#icon-arrow-right-2-16"></use></svg></span>
        </a>
      </li>
      <li>
        <a class="row" href="#">
          <span class="col-xs-1"><svg class="icon icon-24"><use xlink:href="#icon-dots-v-24"></use></svg></span>
          <span class="col-xs-9">Dock Collection</span>
          <span class="col-xs-2 text-center"><svg class="icon icon-16"><use xlink:href="#icon-arrow-right-2-16"></use></svg></span>
        </a>
      </li>
    </ul>
    <p>
      <button type="button" class="btn btn-link">+ Add products</button>
    </p>
  </pe-layout-sidebar>
</pe-layout-content>
  `;
}
