import { Inject } from 'ng-forward';
import AuthenticationService from '../services/authentication.service';
import LoginComponent from '../components/auth/login/login.component';
import 'reflect-metadata';

@Inject('$mdDialog', '$state', AuthenticationService)
class AuthenticationConfig {
  constructor($mdDialog, $state, AuthenticationService) {
    this.$mdDialog = $mdDialog;
    this.$state = $state;
    return AuthenticationService.isAuthenticated().then().fail(::this.redirectToLogin);
  }

  redirectToLogin() {
    console.log(this.$state.current.name);
    if (this.$state.current.name === 'login') {
      return;
    }
    this.$state.go('login');
    // this.$mdDialog.show({
    //   controller: LoginComponent,
    //   template: require('../components/auth/login/login.modal.html'),
    //   parent: angular.element(document.body),
    //   clickOutsideToClose: false
    // });
  }

  @Inject('$mdDialog', '$state', AuthenticationService)
  static init($mdDialog, $state, AuthenticationService) {
    AuthenticationConfig.instance = new AuthenticationConfig($mdDialog, $state, AuthenticationService);
    return AuthenticationConfig.instance;
  }
}

export default angular.module('roseStAdmin.auth', ['ngMaterial']).run(AuthenticationConfig.init);
