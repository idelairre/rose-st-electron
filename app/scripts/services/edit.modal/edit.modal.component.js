import { Component, Inject } from 'ng-forward';
import 'reflect-metadata';
import 'angular-ui-tinymce';

const inflect = require('inflected');

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
    this.action = action;
    this.fields = object._meta_;
    this.name = object.constructor.name;
    this.object = object;
    this.master = angular.copy(object);
    this.users = (typeof users === 'undefined') ? [] : users;
    this.$scope.tinymceOptions = {
      skin_url: 'app/assets/skins/light/',
      content_css: 'app/assets/skins/light/content.min.css',
      content_style: 'div { font-size: 12px }',
      inline: false,
      menubar: '',
      toolbar: 'styleselect | fontsizeselect | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | bullist numlist | link image',
      fontsize_formats: '8pt 10pt 12pt 14pt 18pt 24pt 36pt',
      plugins: 'link image',
      width: '100%',
      height: '100%'
    };
  }

  parseField(field) {
    let parsedField = inflect.underscore(field.toLowerCase());
    return inflect.humanize(parsedField);
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
    if (this.action === 'Create') {
      this.object = {};
    } else {
      angular.copy(this.master, this.object);
    }
  }

  dismiss() {
    this.reset();
    return this.$mdDialog.cancel();
  }

  ok(object) {
    console.log(this.object);
    return this.$mdDialog.hide({ action: this.action, objectSlug: this.object });
  }

  checkField(field) {
    for (let key in this.object) {
      if (key === field && this.object._meta_[key] !== 'hidden') {
        return true;
      }
    }
    return false;
  }
}
