import { Component, Inject } from 'ng-forward';
import AuthModal from '../auth.modal';
import AuthenticationService from '../../../services/authentication.service';
import Unlock from '../unlock/unlock.component';
import 'reflect-metadata';

@Component({
    selector: 'recover-password',
    controllerAs: 'RecoverPassword',
    template: require('./recover-password.html'),
    providers: ['ngMaterial', 'ngMessages', AuthenticationService]
})

@Inject('$mdDialog', '$state', AuthenticationService)
export default class RecoverPassword extends AuthModal {
  constructor($mdDialog, $scope, $state, AuthenticationService) {
    super($mdDialog, $state, AuthenticationService);
  }

  async submit(credentials) {
    console.log(credentials);
    try {
      let redirectDialog = this.$mdDialog.alert()
        .title('Reset password')
        .textContent('An email has been sent to your address with instructions')
        .ariaLabel('password reset notice')
        .ok('ok');

      let unlockDialog = {
        controller: Unlock,
        controllerAs: 'Unlock',
        template: require('../unlock/unlock.modal.html'),
        parent: angular.element(document.body)
      };

      this.$mdDialog.show(redirectDialog).then(() => {
        this.$mdDialog.show(unlockDialog);
      });

      let response = await this.authService.resetPassword(credentials);
      console.log(response);
    } catch (error) {
      this.handleErrors(error)
    }
  }
}
