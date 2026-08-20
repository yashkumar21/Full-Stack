import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'kgToGrams',
  standalone: true
})
export class KgToGramsPipe implements PipeTransform {

  transform(value: number): String {
    return (value*1000).toFixed(2) + 'g';
  }

}
