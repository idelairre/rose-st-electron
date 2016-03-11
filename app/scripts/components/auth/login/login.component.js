import { Component, Inject } from 'ng-forward';
import AuthModal from '../auth.modal';
import AuthenticationService from '../../../services/authentication.service';
import RecoverPassword from '../recover-password/recover-password.component';
import Unlock from '../unlock/unlock.component';
import 'reflect-metadata';

@Component({
    selector: 'login',
    controllerAs: 'Login',
    template: require('./login.screen.html'),
    providers: ['ngMaterial', 'ngMessages', AuthenticationService]
})

@Inject('$mdDialog', '$state', '$window', AuthenticationService)
export default class Login extends AuthModal {
  constructor($mdDialog, $state, $window, AuthenticationService) {
    super($mdDialog, $state, AuthenticationService);
    this.$window = $window;
    this.credentials = {
      email: '',
      password: ''
    };
  }

  resetPassword(credentials) {
    let resetPasswordDialog = {
      controller: RecoverPassword,
      controllerAs: 'RecoverPassword',
      template: require('../recover-password/recover-password.html'),
      parent: angular.element(document.body)
    };

    this.$mdDialog.show(resetPasswordDialog);
  }

  handleErrors(error) {
    console.error(error);
    let errorDialogue = this.$mdDialog.alert()
      .title('Login Failed')
      .clickOutsideToClose(false)
      .escapeToClose(false)
      .textContent(`error: ${error.reason}`)
      .ariaLabel(`error modal: ${error}`)
      .ok('try again');
    this.$mdDialog.show(errorDialogue).then(::this.openLogin);
  }

  onEnter(event, loginForm) {
    const ENTER_KEY = 13;
    if (event.keyCode === 13) {
      if (loginForm.$valid) {
        this.submit(this.credentials);
      }
      console.log(loginForm);
    }
  }

  openLogin() {
    if (this.$state.current.name === 'login') {
      return;
    }
    this.$mdDialog.show({
      controller: Login,
      controllerAs: 'Login',
      template: require('./login.modal.html'),
      parent: angular.element(document.body),
      clickOutsideToClose: false,
      escapeToClose: false
    });
  }

  register() {
    this.$state.go('registration');
  }

  handleLogin(response) {
    if (this.$state.current.name === 'login') {
      this.$window.dispatchEvent(new Event('loginSuccess'));
      this.$state.go('home');
    } else {
      let loginSuccess = this.$mdDialog.alert()
        .title('Login Successful')
        .textContent(`Welcome ${response.uid}`)
        .ariaLabel('login successful alert modal')
        .ok('ok');

      this.$mdDialog.show(loginSuccess).then(() => {
        setTimeout(() => {
          this.$mdDialog.hide();
          this.$state.go('home');
        }, 1500);
      });
    }
  }

  async submit(credentials) {
    try {
      this.$window.dispatchEvent(new Event('loginStarted'));
      let response = await this.authService.login(credentials);
      this.handleLogin(response.data);
    } catch (error) {
      this.handleErrors(error);
      this.$window.dispatchEvent(new Event('loginFailed'));
    }
  }
}
