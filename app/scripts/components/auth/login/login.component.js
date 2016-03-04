import { Component, Inject } from 'ng-forward';
import AuthenticationService from '../../../services/authentication.service';
import 'reflect-metadata';

@Component({
    selector: 'login',
    controllerAs: 'Login',
    template: require('./login.screen.html'),
    providers: ['ngMaterial', AuthenticationService]
})

@Inject('$mdDialog', '$scope', '$state', AuthenticationService)
export default class Login {
  constructor($mdDialog, $scope, $state, AuthenticationService) {
    this.$mdDialog = $mdDialog;
    this.$scope = $scope;
    this.$scope.credentials = {};
    this.$scope.dismiss = ::this.dismiss;
    this.$scope.submit = ::this.submit;
    this.$scope.resetPassword = ::this.resetPassword;
    this.$state = $state;
    this.authService = AuthenticationService;
  }

  dismiss() {
    this.reset();
  }

  resetPassword(credentials) {
    // this.authService.resetPassword(credentials);
    let redirectDialog = this.$mdDialog.confirm()
      .title('Reset password')
      .clickOutsideToClose(false)
      .textContent('An email has been sent to your address with instructions')
      .ariaLabel('redirect notice')
      .cancel('cancel')
      .ok('ok');
    this.$mdDialog.show(redirectDialog).then(::this.openLogin, ::this.openLogin);
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
    this.$mdDialog.hide();
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
