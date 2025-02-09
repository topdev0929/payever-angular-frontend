import { Directive, ElementRef, AfterViewInit } from "@angular/core";

declare let $: any;

@Directive({
    selector: "[peReadMore]",
})
export class ReadMoreDirective implements AfterViewInit {

    private el: any;
    private text: string;
    private link: string = "Read more";
    private length: number;
    private limit: number = 55;

    constructor(private elementRef: ElementRef) {
    }

    ngAfterViewInit() {
        let _that = this;
        this.el = this.elementRef.nativeElement;
        if ($(this.el).attr("maxlength")) this.limit = $(this.el).attr("maxlength");
        if ($(this.el).data("readmore")) this.link = $(this.el).data("readmore");
        this.text = $(this.el).text();
        this.length = this.text.length;
        if ( this.length > this.limit ) {
            $(this.el).html( this.cutString( this.text, this.limit) + "... <span class='ui-readmore'>" + this.link + "</span>" );
        }
        $(this.el).children(".ui-readmore").on("click", function( e: MouseEvent, th: any = _that ) {
            $(this).remove();
            $(th.el).html(th.text);
        });
    }

    private cutString( s: string , n: number) {
        let cut = s.indexOf(" ", n);
        if ( cut === -1 ) return s;
        return s.substring(0, cut);
    }

}
