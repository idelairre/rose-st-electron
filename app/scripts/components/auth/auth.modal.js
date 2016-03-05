import {  Inject } from 'ng-forward';
import AuthenticationService from '../../services/authentication.service';
import 'reflect-metadata';

@Inject('$mdDialog', '$scope', '$state', AuthenticationService)
export default class AuthModal {
  constructor($mdDialog, $scope, $state, AuthenticationService) {
    this.$mdDialog = $mdDialog;
    this.$scope = $scope;
    this.$scope.credentials = {};
    this.$state = $state;
    this.authService = AuthenticationService;
  }
}
