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

  success(response) {
    return this.$mdDialog.show(
      this.$mdDialog.alert()
      .title('Password updated')
      .textContent(`Status: ${response.status}`)
      .ariaLabel('password reset modal')
      .ok('ok')
    );
  }

  dismiss() {
    return this.$mdDialog.cancel();
  }

  error(reason, error) {
    return this.$mdDialog.show(this.$mdDialog.alert()
      .title('Error')
      .clickOutsideToClose(true)
      .textContent(`${error.toString()}`)
      .ariaLabel(`error modal: ${reason}`)
      .ok('close')
    );
  }

  async submit(credentials) {
    try {
      let response = await this.authService.updatePassword(credentials);
      return this.success(response);
    } catch (error) {
      console.error(error);
      return this.error(error.reason, error.data.errors.full_messages);
    }
  }
}

// http://rose-st-api.herokuapp.com/auth/password/edit?config=default&redirect_url=file%3A%2F%2F%2Fhome%2Fian%2FDownloads%2Fprojects%2Felectron_test%2Findex.html%23%2Flogin&reset_password_token=ykMsjHyvdXcdzjDrWeXG{
