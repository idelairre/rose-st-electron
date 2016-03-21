import { Pipe } from 'ng-forward';
import inflected from 'inflected';

@Pipe
export default class Inflector {
  transform(item, argument) {
    return inflected[argument](item);
  }
}
