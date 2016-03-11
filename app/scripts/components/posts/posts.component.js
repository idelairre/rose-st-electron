import { Component, Inject, Resolve } from 'ng-forward';
import { CLIENT_URL } from '../../constants/constants';
import Post from './post.model';
<<<<<<< HEAD
=======
import AuthenticationService from '../../services/authentication.service';
>>>>>>> fb7bfaea9e6a13cabe03521be92e622ad03cf7fb
import ModalService from '../../services/modal.service';
import Table, { TableComponent } from '../table/table.component';
import User from '../users/user.model';
import 'angular-ui-tinymce';
import 'babel-polyfill';
import 'reflect-metadata';

<<<<<<< HEAD
let open = require('open');

=======
>>>>>>> fb7bfaea9e6a13cabe03521be92e622ad03cf7fb
@Component({
  selector: 'posts',
  controllerAs: 'Posts',
  template: require('./posts.html'),
  directives: [Table],
<<<<<<< HEAD
  providers: ['ui.tinymce']
})

@Inject('posts', ModalService)
=======
  providers: ['ui.tinymce', AuthenticationService, ModalService]
})

@Inject('posts', AuthenticationService, ModalService)
>>>>>>> fb7bfaea9e6a13cabe03521be92e622ad03cf7fb
export default class Posts extends TableComponent {
  @Resolve()
  static posts() {
    return Post.query();
  }

<<<<<<< HEAD
  constructor(posts, ModalService) {
    super(ModalService);

    this.fields = ['id', 'title', 'subheading', 'user', 'created_at', 'updated_at'];
    this.options.actions = ['add', 'preview', 'edit', 'delete', 'deleteAll'];
=======
  constructor(posts, AuthenticationService, ModalService) {
    super(AuthenticationService, ModalService);

    this.authService = AuthenticationService;
    this.fields = ['id', 'title', 'subheading', 'user', 'created_at', 'updated_at'];
    this.options.actions = (::this.evalAdmin() ? ['add', 'preview', 'edit', 'delete', 'deleteAll'] : ['preview']);
>>>>>>> fb7bfaea9e6a13cabe03521be92e622ad03cf7fb
    this.options.selectParam = 'title';
    this.options.filterFields = {
      created_at: 'date',
      updated_at: 'date'
    };
    this.model = Post;
    this.posts = posts;
  }

  add(event) {
    let locals = {
      action: 'Create',
      object: new Post()
    };
    this.modalService.addDialog(locals).then(::this.handleSubmit);
  }

  edit(event) {
    let post = this.getSelected();
    let locals = {
      action: 'Update',
      object: post,
      users: users
    };
    this.modalService.edit(locals).then(::this.handleSubmit);
  }

<<<<<<< HEAD
  preview(event) {
    let post = this.getSelected();
    this.modalService.redirect().then(() => {
      open(`${CLIENT_URL}/${post.title_url}`);
    });
=======
  // TODO: use electron spawn to open browser
  preview() {
    let post = this.getSelected();
    let event = new CustomEvent('openBrowser', { detail: `${CLIENT_URL}/posts/${post.title_url}` });
    window.dispatchEvent(event);
>>>>>>> fb7bfaea9e6a13cabe03521be92e622ad03cf7fb
  }

  async handleSubmit(slug) {
    try {
      let action = slug.action;
<<<<<<< HEAD
      let postSlug = slug.objectSlug;
      if (action === 'Update') {
        let post = this.posts.filter(post => { return postSlug.id === post.id })[0];
        await post.save(postSlug);
=======
      if (action === 'Update') {
        let post = slug.objectSlug;
        post.save();
>>>>>>> fb7bfaea9e6a13cabe03521be92e622ad03cf7fb
      } else if (action === 'Create') {
        let post = new Post(postSlug);
        this.posts.push(post);
      }
    } catch (error) {
      console.log(error);
      super.handleErrors(error);
    }
  }
}
