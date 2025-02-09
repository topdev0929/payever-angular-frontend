import { Directive, ElementRef, OnInit } from '@angular/core';

declare var $:any;

@Directive({
  selector: '[html-entities]'
})
export class HtmlEntitiesDirective implements OnInit {
  private el: any;

  constructor(private elementRef: ElementRef<HTMLInputElement>) {
  }

  ngOnInit() {
    this.el = this.elementRef.nativeElement;
    this.el.innerHTML = this.encode(this.el.innerHTML);
  }

  encode(str: string) {
    return $("<div/>").text(str).html();
  }

}
