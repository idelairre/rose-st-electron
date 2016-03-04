import { Inject } from 'ng-forward';
import 'reflect-metadata';

class RoutesConfig {
  @Inject('$stateProvider', '$urlRouterProvider', '$locationProvider')
  static run($stateProvider, $urlRouterProvider, $locationProvider) {
    $locationProvider.html5Mode({
      enabled: false
    })
    $urlRouterProvider.otherwise('/login');
  }
}

export default angular.module('roseStAdmin.config', []).config(RoutesConfig.run);
