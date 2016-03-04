import { Inject } from 'ng-forward';
import 'reflect-metadata';

class MdThemeConfig {
  @Inject('$mdThemingProvider')
  static run($mdThemingProvider) {
    $mdThemingProvider.theme('default')
      .primaryPalette('red')
      .accentPalette('brown');
    }
}

export default angular.module('roseStAdmin.theme', ['ngMaterial']).config(MdThemeConfig.run);
