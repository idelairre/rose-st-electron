import { Component, EventEmitter, Input, Injectable, Inject, Output } from 'ng-forward';
import AuthenticationService from '../../services/authentication.service';
import ModalService from '../../services/modal.service';
import Pagination from './pagination/pagination';
import TableContainer from './table-container/table-container';
import Toolbar from './toolbar/toolbar';

let inflect = require('i')();

@Component({
  selector: 'rs-table',
  controllerAs: 'RsTable',
  template: require('./table.html'),
  directives: [TableContainer, Toolbar, Pagination],
  inputs: ['items', 'fields', 'options', 'selected', 'query', 'title', 'model'],
  outputs: ['add', 'delete', 'edit', 'massDelete', 'preview']
})

export default class Table {
  @Input() items;
  @Input() fields;
  @Input() model;
  @Input() options;
  @Input() query;
  @Input() selected;
  @Input() title;
  @Output() add;
  @Output() delete;
  @Output() massDelete;
  @Output() edit;
  @Output() preview;
  constructor() {
    this.add = new EventEmitter();
    this.delete = new EventEmitter();
    this.massDelete = new EventEmitter();
    this.edit = new EventEmitter();
    this.preview = new EventEmitter();
  }

  addAction() {
    this.add.next();
  }

  deleteAction(event, item) {
    this.delete.next(event, item);
  }

  editAction(event, item) {
    this.edit.next(event, item);
  }

  massDeleteAction(event) {
    this.massDelete.next(event);
  }

  previewAction(event, item) {
    this.preview.next(event, item);
  }
}

@Injectable()
@Inject(ModalService, AuthenticationService)
export class TableComponent {
  constructor(ModalService, AuthenticationService) {
    this.selected = [];

    this.options = {
      autoSelect: true,
      boundaryLinks: false,
      largeEditDialog: false,
      pageSelector: false,
      rowSelection: true,
    };

    this.query = {
      order: 'id',
      limit: 5,
      page: 1
    };

    this.authService = AuthenticationService;
    this.modalService = ModalService;
  }

  evalAdmin() {
    let user = this.authService.getUser();
    this.isAdmin = user.admin;
  }

  getSelected() {
    const OBJ = this.model.getInstance().constructor.name.toLowerCase();
    const OBJ_PLURAL = inflect.pluralize(OBJ);
    const SELECT_PARAM = this.options.selectParam;

    return this[OBJ_PLURAL].filter(item => {
      return item[SELECT_PARAM] === this.selected[0]
    })[0];
  }

  deleteAll(event) {
    const OBJ = this.model.getInstance().constructor.name.toLowerCase();
    const OBJ_PLURAL = inflect.pluralize(OBJ);
    const SELECT_PARAM = this.options.selectParam;

    this.modalService.confirmDelete().then(() => {
      this.selected.map(itemSelectParam => {
        let target = this[OBJ_PLURAL].filter(item => { return itemSelectParam === item[SELECT_PARAM] })[0];
        target.delete();
      });
      this.selected.length = 0;
      this[OBJ_PLURAL].length = 0;
    });
  }

  delete(event) {
    const OBJ_PLURAL = inflect.pluralize(this.model.getInstance().constructor.name).toLowerCase();
    const SELECT_PARAM = this.options.selectParam;

    this.modalService.confirmDelete().then(() => {
      let item = this.getSelected();
      item.delete();
      this.selected.splice(this.selected.indexOf(item[SELECT_PARAM]), 1);
      this[OBJ_PLURAL].splice(this[OBJ_PLURAL].indexOf(item), 1);
    });
  }

  handleErrors(error) {
    console.error(error);
    return this.modalService.hide().then(() => {
      this.modalService.error(error);
    });
  }
}
