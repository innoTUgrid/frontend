import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'camelCaseToSpace'
})
export class CamelCaseToSpacePipe implements PipeTransform {
  transform(value: string): string {
    return value
      .replace(/([a-z])([A-Z])/g, '$1 $2')  // Add space between camelCase
      .replace(/\b\w/g, firstChar => firstChar.toUpperCase());  // Capitalize each word
  }
}
