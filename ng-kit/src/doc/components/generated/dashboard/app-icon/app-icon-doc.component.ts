import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'doc-app-icon',
    templateUrl: './app-icon-doc.component.html',
    // styleUrls: ["../../../../scss/src/_icons-db.scss"],
    styleUrls: ['app-icon-doc.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppIconDocComponent {
    public appLabel: string;
    @Input() public set app(app: any) {
        this.appLabel = app.label;
    }
}
