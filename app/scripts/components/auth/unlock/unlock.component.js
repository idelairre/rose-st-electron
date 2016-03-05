import { Component, Inject } from 'ng-forward';
import AuthModal from '../auth.modal';
import AuthenticationService from '../../../services/authentication.service';
import 'reflect-metadata';

@Component({
    selector: 'unlock',
    controllerAs: 'Unlock',
    template: require('./unlock.modal.html'),
    providers: ['ngMaterial', AuthenticationService]
})

@Inject('$mdDialog', '$scope', '$state', AuthenticationService)
export default class Unlock extends AuthModal {
  constructor($mdDialog, $scope, $state, AuthenticationService) {
    super($mdDialog, $scope, $state, AuthenticationService);
    this.$scope.dismiss = ::this.dismiss;
    this.$scope.submit = ::this.submit;
  }

  dismiss() {
    this.$mdDialog.hide();
  }

  async submit(credentails) {
    try {
      let params = {
        config: 'default',
        redirect_url: window.location.href.replace(/#.*/g, ''),
        reset_password_token: credentails.token
      };
      console.log(this.authService.getHeaders());
      this.dismiss();
      await this.authService.getTokenAfterPasswordReset(params);
      console.log(window.location.pathname);
    } catch (error) {
      this.handleErrors(error);
    }
  }
}
