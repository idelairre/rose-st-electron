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
    providers: ['ngMaterial', AuthenticationService]
})

@Inject('$mdDialog', '$scope', '$state', AuthenticationService)
export default class Login extends AuthModal {
  constructor($mdDialog, $scope, $state, AuthenticationService) {
    super($mdDialog, $scope, $state, AuthenticationService);
    this.$scope.submit = ::this.submit;
    this.$scope.resetPassword = ::this.resetPassword;
  }

  resetPassword(credentials) {
    let resetPasswordDialog = {
      controller: RecoverPassword,
      template: require('../recover-password/recover-password.html'),
      parent: angular.element(document.body)
    };

    this.$mdDialog.show(resetPasswordDialog);
  }

  handleErrors(error) {
    console.error(error);
    let errorDialogue = this.$mdDialog.confirm()
      .title('Login Failed')
      .clickOutsideToClose(false)
      .escapeToClose(false)
      .textContent(`error: ${error.reason}`)
      .ariaLabel(`error modal: ${error}`)
      .ok('try again');
    this.$mdDialog.show(errorDialogue).then(::this.openLogin);
  }

  openLogin() {
    if (this.$state.current.name === 'login') {
      return;
    }
    this.$mdDialog.show({
      controller: Login,
      template: require('./login.modal.html'),
      parent: angular.element(document.body),
      clickOutsideToClose: false,
      escapeToClose: false
    });
  }

  handleLogin(response) {
    // this.$mdDialog.hide();
    let loginSuccess = this.$mdDialog.alert()
      .title('Login Successful')
      .textContent(`Welcome ${response.uid}`)
      .ariaLabel('login successful alert modal')
      .ok('ok');
    if (this.$state.current.name === 'login') {
      this.$state.go('home');
    } else {
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
      let response = await this.authService.login(credentials);
      this.handleLogin(response.data);
    } catch (error) {
      this.handleErrors(error)
    }
  }
}
