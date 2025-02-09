import { Pipe, PipeTransform } from '@angular/core';

declare var $:any;

@Pipe({
  name: 'code',
  pure: false
})
export class CodePipe implements PipeTransform {

  transform(value: string): string {
    return $("<div/>").text(value).html().trim();
  }
}
