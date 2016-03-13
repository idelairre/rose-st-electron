import { Inject } from 'ng-forward';
import AuthenticationService from '../services/authentication.service';
import 'reflect-metadata';

@Inject('$mdDialog', '$state', '$window', AuthenticationService)
class AuthenticationConfig {
  constructor($mdDialog, $state, $window, AuthenticationService) {
    this.$mdDialog = $mdDialog;
    this.$window = $window;
    this.$state = $state;
    this.authService = AuthenticationService;

    this.$window.addEventListener('auth', ::this.validateTempToken);
    this.$window.addEventListener('logout', ::this.logout);
    this.$window.addEventListener('loaded', ::this.validateUser);

    this.$window.addEventListener('googleAuth', ::this.validateGoogle);
    this.$window.addEventListener('googleRedirect', ::this.handleGoogleRedirect);
    return this.validateUser();
  }

  handleGoogleRedirect(url) {
    console.log(url);
    let event = new CustomEvent('openBrowser', { detail: url });
    this.$window.dispatchEvent(event);
  }

  logout() {
    this.redirectToLogin();
    this.authService.logout();
  }

  async validateGoogle(event) {
    try {
      await this.authService.getOauthTokens(event.detail);
    } catch (error) {
      console.error(error);
    }
  }

  async validateTempToken(event) {
    try {
      await this.authService.setTokenAfterPasswordReset(event.detail);
      await setTimeout(this.authService.isAuthenticated, 300);
      this.$state.go('home');
      this.modalService.passwordWarn();
    } catch (error) {
      console.error(error);
    }
  }

  async validateUser() {
    return this.authService.isAuthenticated().then(() => {
      // console.log(this.authService.getUser());
    }).fail(::this.redirectToLogin);
  }

  redirectToLogin() {
    if (this.$state.current.name === 'login') {
      return;
    }
    this.$state.go('login');
  }

  @Inject('$mdDialog', '$state', '$window', AuthenticationService)
  static init($mdDialog, $state, $window, AuthenticationService) {
    AuthenticationConfig.instance = new AuthenticationConfig($mdDialog, $state, $window, AuthenticationService);
    return AuthenticationConfig.instance;
  }
}

export default angular.module('roseStAdmin.auth', ['ngMaterial']).run(AuthenticationConfig.init);
