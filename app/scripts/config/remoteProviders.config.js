import { Inject } from 'ng-forward';
import 'reflect-metadata';

class RemoteProviders {
  @Inject('remoteProvider')
  static run(remoteProvider) {
    remoteProvider.register('googleapis');
    console.log(remoteProvider);
  }
}

export default angular.module('roseStAdmin.remoteProviders', ['angular-electron']).config(RemoteProviders.run);
