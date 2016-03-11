import {  Inject } from 'ng-forward';
import AuthenticationService from '../../services/authentication.service';
import 'reflect-metadata';

@Inject('$mdDialog', '$state', AuthenticationService)
export default class AuthModal {
  constructor($mdDialog, $state, AuthenticationService) {
    this.$mdDialog = $mdDialog;
    this.$state = $state;
    this.authService = AuthenticationService;
  }

  dismiss() {
    this.$mdDialog.hide();
  }
}
