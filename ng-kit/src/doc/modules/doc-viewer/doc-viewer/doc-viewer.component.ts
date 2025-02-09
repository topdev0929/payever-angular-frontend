import { Component, Input, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'doc-viewer',
  template: '<div [innerHtml]="text"></div>'
})
export class DocViewerComponent {
  text: string = 'Loading document...';
  private documentFetchSubscription: any;

  /** The URL of the document to display. */
  @Input()
  set documentUrl(url: string) {
    this.fetchDocument(url);
  }

  constructor(private http: HttpClient) {}

  /** Fetch a document by URL. */
  private fetchDocument(url: string): void {
    this.documentFetchSubscription = this.http.get(url).subscribe(
      response => {
        if (response['ok']) {
          this.text = String(response);
        } else {
          this.text = `Failed to load document: ${url}. Error: ${response['status'] || ''}`;
          console.error(this.text);
        }
      },
      error => {
        if (error && error.error && error.error.text) {
          this.text = error.error.text;
        } else {
          this.text = `Failed to load document: ${url}. Error: ${error}`;
          console.error(this.text);
        }
      }
    );
  }
}
