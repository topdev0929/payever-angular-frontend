import { Pipe, PipeTransform } from "@angular/core";

import { HIDDEN_VALUE } from "../../shared";

@Pipe({
  name: 'ifHidden',
  pure: true,
})
export class CheckIfHiddenPipe implements PipeTransform {
  transform(value: string): string {
    return value.includes(HIDDEN_VALUE) ? '' : value;
  }
}
