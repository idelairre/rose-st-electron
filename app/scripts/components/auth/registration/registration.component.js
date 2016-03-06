import { Component, Inject } from 'ng-forward';
import AuthenticationService from '../../../services/authentication.service';

@Component({
  selector: 'registration',
  controllerAs: 'Registration',
  template: require('./registration.html'),
  providers: ['ngMaterial', 'ngMessages', 'ngPassword', AuthenticationService]
})

@Inject('$mdDialog', AuthenticationService)
export default class Registration {
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
      .title('Registration successful')
      .textContent(`Status: ${response.status}`)
      .ariaLabel('Registration successful')
      .ok('ok')
    );
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
