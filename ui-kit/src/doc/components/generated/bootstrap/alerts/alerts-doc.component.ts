import { Component } from '@angular/core';

@Component({
  selector: 'doc-alerts',
  templateUrl: 'alerts-doc.component.html'
})
export class AlertsDocComponent {
  examples = {
    default: require('./examples/alerts-default.component.html.txt'),
    dismissable: require('./examples/alerts-dismissable.component.html.txt')
  };
}
