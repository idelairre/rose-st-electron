import { Component, Inject } from 'ng-forward';
import AuthenticationService from '../../services/authentication.service';
import 'babel-polyfill';
import 'reflect-metadata';

@Component({
  selector: 'rose-st-nav',
  controllerAs: 'Nav',
  template: require('./nav.html'),
  providers: [AuthenticationService]
})

@Inject('$mdDialog', '$mdSidenav', '$scope', '$state', '$window', AuthenticationService)
export default class Nav {
  constructor($mdDialog, $mdSidenav, $scope, $state, $window, AuthenticationService) {
    this.$mdDialog = $mdDialog;
    this.$mdSidenav = $mdSidenav;
    this.$scope = $scope;
    this.$state = $state;
    this.$window = $window;
    this.authService = AuthenticationService;
    this.tabIndex = 0;
    this.routes = ['home', 'analytics', 'donations', 'messages', 'posts', 'users', 'profile'];
    this.$scope.$watch(::this.evalTabIndex, ::this.setState);
    this.$scope.$watch(::this.evalState, ::this.setTabIndex);
  }

  ngOnInit() {
    this.setTabIndex(this.$state.current.name);
  }

  close(navId) {
    this.$mdSidenav(navId).close();
  }

  evalLoginState() {
    return this.$state.current.name === 'login' || this.$state.current.name === 'registration';
  }

  evalState() {
    return this.$state.current.name;
  }

  evalTabIndex() {
    return this.tabIndex;
  }

  open(navId) {
    this.$mdSidenav(navId).toggle();
  }

  async logout() {
    await this.authService.logout();
    this.$state.go('login');
  }

  setState(currentState) {
    this.$state.go(this.routes[currentState]);
  }

  setTabIndex(currentState, previousState) {
    if (currentState !== previousState) {
      for (let i = 0; this.routes.length > i; i += 1) {
        if (this.routes[i] === currentState) {
          this.tabIndex = i;
        }
      }
    }
  }
}
