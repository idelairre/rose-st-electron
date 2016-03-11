import { Component, Inject, Resolve } from 'ng-forward';
import Message from './message.model';
import ModalService from '../../services/modal.service';
import Table, { TableComponent } from '../table/table.component';
import 'angular-ui-tinymce';
import 'babel-polyfill';
import 'reflect-metadata';

@Component({
  selector: 'messages',
  controllerAs: 'Messages',
  template: require('./messages.html'),
  directives: [Table]
})

@Inject('messages', ModalService)
export default class Messages extends TableComponent { // react envy
  @Resolve()
  static messages() {
    return Message.query();
  }

  constructor(messages, ModalService) {
    super(ModalService);
    this.fields = ['id', 'name', 'email', 'created_at', 'updated_at'];
    this.options.actions = ['delete', 'deleteAll'];
    this.options.selectParam = 'id';
    this.options.filterFields = {
      created_at: 'date',
      updated_at: 'date',
    };
    this.messages = messages;
    this.model = Message;
  }

  add(event) {
    let locals = {
      action: 'Create',
      object: new Message()
    };
    this.modalService.addDialog(locals).then(::this.handleSubmit);
  }

  edit(event) {
    let message = this.getSelected();
    let locals = {
      action: 'Update',
      object: message
    };
    this.modalService.edit(locals).then(::this.handleSubmit);
  }
}
