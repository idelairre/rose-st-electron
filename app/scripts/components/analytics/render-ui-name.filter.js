import { Pipe } from 'ng-forward';
import inflected from 'inflected';
import 'reflect-metadata';

@Pipe
export default class RenderUiName {
  transform(item) {
    return inflected.humanize(inflected.underscore(item.replace(/(\d+)/, '$1 ').replace(/ga:/, '')));
  }
}
