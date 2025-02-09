import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'example-viewer',
  templateUrl: 'example-viewer.component.html'
})
export class ExampleViewerComponent implements OnInit {

  @Input() title: string;
  @Input() tsExample: string;
  @Input() htmlExample: string;
  @Input() cssExample: string;

  @Input() set disableToggle(disableToggle: boolean) {
    this._disableToggle = disableToggle;
    if (disableToggle) {
      this.sourceCodeActive = true;
    }
  }
  get disableToggle(): boolean {
    return this._disableToggle;
  }

  sourceCodeActive: boolean = false;

  private _disableToggle: boolean = false;

  ngOnInit(): void {
    if (this.disableToggle) {
      this.sourceCodeActive = true;
    }
  }

  toggleSourceCode(): void {
    this.sourceCodeActive = !this.sourceCodeActive;
  }
}
