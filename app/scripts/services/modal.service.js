import { Injectable, Inject } from 'ng-forward';
import EditModal from './edit.modal/edit.modal.component';
import Password from '../components/auth/password/password.component';
import User from '../components/users/user.model';

// NOTE: make sure locals resolve BEFORE they reach this service or
// or the context of the modals will get screwed up since loading modals
// are produced after each ajax request

@Injectable()
@Inject('$mdDialog')
export default class ModalService {
  constructor($mdDialog) {
    this.$mdDialog = $mdDialog;
  }

  async addDialog(locals) {
    locals.users = await User.query();
    let dialog = {
      controller: EditModal,
      controllerAs: 'Edit',
      template: require('./edit.modal/edit.modal.html'),
      clickOutsideToClose: true,
      parent: angular.element(document.body),
      locals: locals
    };
    return this.$mdDialog.show(dialog);
  }

  async edit(locals) {
    locals.users = await User.query();
    let dialog = {
      controller: EditModal,
      controllerAs: 'Edit',
      template: require('./edit.modal/edit.modal.html'),
      clickOutsideToClose: true,
      escapeToClose: true,
      parent: angular.element(document.body),
      locals: locals
    };
    return this.$mdDialog.show(dialog);
  }

  confirmDelete() {
    return this.$mdDialog.show(this.$mdDialog.confirm()
      .title('Confirm delete')
      .clickOutsideToClose(false)
      .textContent('are you sure?') // maybe I want to notify the author and send them an email with the content
      .ariaLabel('confirm delete')
      .ok('yes')
      .cancel('no')
    );
  }

  error(error) {
    return this.$mdDialog.show(this.$mdDialog.alert()
      .title('Error')
      .clickOutsideToClose(true)
      .textContent(`${error}`)
      .ariaLabel(`error modal: ${error}`)
      .ok('close')
    );
  }

  loadingModal() {
    let dialog = {
      template: require('./loading.modal/loading.modal.html'),
      parent: angular.element(document.body),
      fullscreen: false,
      clickOutsideToClose: false,
      hasBackdrop: false
    };
    return this.$mdDialog.show(dialog);
  }

  redirect() {
    return this.$mdDialog.show(this.$mdDialog.confirm()
      .title('Redirect notice')
      .clickOutsideToClose(false)
      .textContent(`Clicking ok will open a new browser tab, you may have to disable popups`)
      .ariaLabel('redirect notice')
      .cancel('cancel')
      .ok('ok')
    );
  }

  // TODO: make this more generalized
  success(model, response) {
    return this.$mdDialog.show(
      this.$mdDialog.alert()
      .title(`${model} created`)
      .textContent(`Status: ${response.status}`)
      .ariaLabel(`${model.toLowerCase()} creation successful`)
      .ok('ok')
    );
  }

  hide() {
    return this.$mdDialog.hide();
  }

  passwordWarn() {
    return this.$mdDialog.show(this.$mdDialog.alert()
      .title('Login successful')
      .clickOutsideToClose(true)
      .textContent('You can reset your password in the profile tab')
      .ariaLabel('reset password warning')
      .ok('close')
    );
  }

  resetPassword() {
    let dialog = {
      controller: Password,
      controllerAs: 'Password',
      template: require('../components/auth/password/password.modal.html'),
      clickOutsideToClose: true,
      escapeToClose: true,
      parent: angular.element(document.body),
    };
    return this.$mdDialog.show(dialog);
  }
}
