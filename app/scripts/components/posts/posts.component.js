import { Component, Inject, Resolve } from 'ng-forward';
import { CLIENT_URL } from '../../constants/constants';
import Post from './post.model';
import AuthenticationService from '../../services/authentication.service';
import ModalService from '../../services/modal.service';
import Table, { TableComponent } from '../table/table.component';
import User from '../users/user.model';
import 'angular-ui-tinymce';
import 'babel-polyfill';
import 'reflect-metadata';

@Component({
  selector: 'posts',
  controllerAs: 'Posts',
  template: require('./posts.html'),
  directives: [Table],
  providers: ['ui.tinymce', AuthenticationService, ModalService]
})

@Inject('$window', 'posts', AuthenticationService, ModalService)
export default class Posts extends TableComponent {
  @Resolve()
  static posts() {
    return Post.query();
  }

  constructor($window, posts, AuthenticationService, ModalService) {
    super(AuthenticationService, ModalService);
    this.$window = $window;
    this.authService = AuthenticationService;
    this.fields = ['id', 'title', 'subheading', 'user', 'created_at', 'updated_at'];
    this.options.actions = (::this.evalAdmin() ? ['add', 'preview', 'edit', 'delete', 'deleteAll'] : ['preview']);
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

  preview() {
    let post = this.getSelected();
    let event = new CustomEvent('openBrowser', { detail: `${CLIENT_URL}/posts/${post.title_url}` });
    this.$window.dispatchEvent(event);
  }

  async handleSubmit(slug) {
    try {
      let action = slug.action;
      if (action === 'Update') {
        let post = slug.objectSlug;
        post.save();
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
