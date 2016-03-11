import { Inject } from 'ng-forward';
import AuthenticationService from '../services/authentication.service';
import 'reflect-metadata';

@Inject('$state', '$window', AuthenticationService)
class EventConfig {
  constructor($state, $window, AuthenticationService) {
    this.$state = $state;
    this.$window = $window;
    this.authService = AuthenticationService;

    this.$window.addEventListener('goto', ::this.goto);
  }

  goto(event) {
    this.$state.go(event.detail);
  }

  @Inject('$state', '$window', AuthenticationService)
  static init($state, $window, AuthenticationService) {
    EventConfig.instance = new EventConfig($state, $window, AuthenticationService);
    return EventConfig.instance;
  }
}

export default angular.module('roseStAdmin.events', []).run(EventConfig.init);
