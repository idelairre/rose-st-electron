import { Component, Inject } from 'ng-forward';
import 'reflect-metadata';
import 'angular-ui-tinymce';

let inflect = require('i')();

@Component({
  selector: 'edit-modal',
  template: require('./edit.modal.html'),
  providers: ['ui.tinymce', 'ngMessages', 'ngPassword']
})

@Inject('$mdDialog', '$scope')
export default class EditModal {
  constructor($mdDialog, $scope, action, object, users) {
    this.$mdDialog = $mdDialog;
    this.$scope = $scope;
    this.$scope.dismiss = ::this.dismiss;
    this.$scope.ok = ::this.ok;
    this.$scope.reset = ::this.reset;
    this.$scope.action = action;
    this.$scope.master = Object.assign({}, object);
    this.$scope.name = object.constructor.name;
    this.$scope.object = Object.assign({}, object);
    this.$scope.users = users;
    this.$scope.filterProps = ::this.filterProps;
    this.$scope.checkUserField = ::this.checkUserField;
    this.$scope.checkPasswordField = ::this.checkPasswordField;
    this.$scope.parseField = ::this.parseField;
    this.$scope.inflect = inflect;
    this.$scope.tinymceOptions = {
      inline: false,
      menubar: '',
      toolbar: 'styleselect | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | bullist numlist | link image',
      plugins: 'link image',
      width: '100%',
      height: '100%'
    };
  }

  parseField(field) {
    const PARSED = inflect.underscore(field);
    return inflect.humanize(PARSED).toLowerCase();
  }

  filterProps(model, property) {
    let newModel = Object.assign({}, model);
    for (let key in newModel) {
      if (newModel[key] !== property) {
        delete newModel[key];
      }
    }
    return newModel;
  }

  reset() {
    if (this.$scope.action === 'Create') {
      this.$scope.object = {};
    } else {
      this.$scope.object = Object.assign({}, this.$scope.master);
    }
  }

  dismiss() {
    this.reset();
    this.$mdDialog.cancel();
  }

  ok(object) {
    console.log(this.$scope.object);
    return this.$mdDialog.hide({ action: this.$scope.action, objectSlug: this.$scope.object });
  }

  checkUserField() {
    for (let key in this.$scope.object) {
      if (key === 'user') {
        return true;
      }
    }
  }

  checkPasswordField() {
    for (let key in this.$scope.object) {
      if (key === 'password') {
        return true;
      }
    }
  }
}
