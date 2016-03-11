import { Component, Inject } from 'ng-forward';
import AuthModal from '../auth.modal';
import AuthenticationService from '../../../services/authentication.service';
import 'reflect-metadata';

@Component({
    selector: 'unlock',
    controllerAs: 'Unlock',
    template: require('./unlock.modal.html'),
    providers: ['ngMaterial', 'ngMessages', AuthenticationService]
})

@Inject('$mdDialog', '$state', AuthenticationService)
export default class Unlock extends AuthModal {
  constructor($mdDialog, $state, AuthenticationService) {
    super($mdDialog,$state, AuthenticationService);
  }

  async submit(credentails) {
    try {
      let params = {
        config: 'default',
        redirect_url: window.location.href.replace(/#.*/g, ''),
        reset_password_token: credentails.token
      };
      this.dismiss();
      await this.authService.getTokenAfterPasswordReset(params);
    } catch (error) {
      this.handleErrors(error);
    }
  }
}
