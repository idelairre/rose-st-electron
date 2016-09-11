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
    this.fields = (this.authService.evalAdmin() ? ['id', 'title', 'subheading', 'user', 'created_at', 'updated_at'] : ['id', 'title', 'subheading', 'created_at', 'updated_at']);
    this.options.actions = (this.authService.evalAdmin() ? ['add', 'preview', 'edit', 'delete', 'deleteAll'] : ['add', 'preview', 'edit', 'delete']);
    this.options.selectParam = 'title';
    this.options.filterFields = {
      created_at: 'date',
      updated_at: 'date'
    };
    this.model = Post;
    this.posts = (this.authService.evalAdmin() ? posts : posts.map(post => {
    	if (post.user_id === this.authService.user.id) {
    		return post;
    	}
    }));
  }

  add(event) {
    let post = new Post();
    this.authService.evalAdmin() ? null : post._meta_.user = 'hidden';
    let locals = {
      action: 'Create',
      object: post
    };
    this.modalService.addDialog(locals).then(::this.handleSubmit);
  }

  edit(event) {
    let post = this.getSelected();
    this.authService.evalAdmin() ? null : post._meta_.user = 'hidden';
    let locals = {
      action: 'Update',
      object: post,
      users: users
    };
    this.modalService.edit(locals).then(::this.handleSubmit);
  }

  preview() {
    const post = this.getSelected();
    const event = new CustomEvent('openBrowser', { detail: `${CLIENT_URL}/posts/${post.title_url}` });
    this.$window.dispatchEvent(event);
  }

  async handleSubmit(slug) {
    try {
      const action = slug.action;
      if (action === 'Update') {
        let post = slug.objectSlug;
        post.save();
      } else if (action === 'Create') {
        let post = new Post(postSlug);
        this.posts.push(post);
      }
    } catch (error) {
      console.log(error);
      this.handleErrors(error);
    }
  }
}
