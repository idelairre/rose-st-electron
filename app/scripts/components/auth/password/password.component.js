import { Component, Inject } from 'ng-forward';
import AuthenticationService from '../../../services/authentication.service';

@Component({
  selector: 'password',
  controllerAs: 'Password',
  template: require('./password.html'),
  providers: ['ngMaterial', 'ngMessages', 'ngPassword', AuthenticationService]
})

@Inject('$mdDialog', AuthenticationService)
export default class Password {
  constructor($mdDialog, AuthenticationService) {
    this.$mdDialog = $mdDialog;
    this.authService = AuthenticationService;
    this.credentials = {
      password: null,
      password_confirmation: null
    };
  }

  dismiss() {
    return this.$mdDialog.cancel();
  }

  async submit(credentials) {
    try {
      credentials = Object.assign(credentials);
      await this.authService.updatePassword(credentials);
    } catch (error) {
      console.error(error);
    }
  }
}

// http://rose-st-api.herokuapp.com/auth/password/edit?config=default&redirect_url=file%3A%2F%2F%2Fhome%2Fian%2FDownloads%2Fprojects%2Felectron_test%2Findex.html%23%2Flogin&reset_password_token=ykMsjHyvdXcdzjDrWeXG{
