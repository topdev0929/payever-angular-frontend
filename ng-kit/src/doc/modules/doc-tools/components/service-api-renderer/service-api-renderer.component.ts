import { Component, Input, OnInit } from '@angular/core';
import { JsDocService } from '../../services';

@Component({
  selector: 'service-api-renderer',
  templateUrl: 'service-api-renderer.component.html'
})
export class ServiceApiRendererComponent implements OnInit {
  @Input() path: string;
  className: string;
  properties: any[] = [];
  private serviceData: any;

  constructor(private docService: JsDocService) {
  }

  ngOnInit() {
    this.serviceData = this.docService.getClassDataByPath(this.path);
    this.className = this.serviceData.name;
  }
}
