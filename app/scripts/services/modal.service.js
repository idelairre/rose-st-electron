import { Injectable, Inject } from 'ng-forward';
import path from 'path'
import EditModal from './edit.modal/edit.modal.component';
import User from '../components/users/user.model';
let inflect = require('i')();

let normalizedPath = require('path').resolve(__dirname, '..', 'components');

@Injectable()
@Inject('$mdDialog')
export default class ModalService {
  constructor($mdDialog) {
    this.$mdDialog = $mdDialog;
  }

  addDialog(locals) {
    let dialog = {
      controller: EditModal,
      template: require('./edit.modal/edit.modal.html'),
      clickOutsideToClose: true,
      parent: angular.element(document.body),
      fullscreen: true,
      locals: locals
    };
    dialog.locals.users = User.query();
    return this.$mdDialog.show(dialog);
  }

  edit(locals) {
    let dialog = {
      controller: EditModal,
      template: require('./edit.modal/edit.modal.html'),
      clickOutsideToClose: true,
      parent: angular.element(document.body),
      fullscreen: true,
      locals: locals
    };
    dialog.locals.users = User.query();
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
}
