import { Component, Inject, Resolve } from 'ng-forward';
import { CLIENT_URL } from '../../constants/constants';
import Post from './post.model';
import ModalService from '../../services/modal.service';
import Table, { TableComponent } from '../table/table.component';
import User from '../users/user.model';
import 'angular-ui-tinymce';
import 'babel-polyfill';
import 'reflect-metadata';

let open = require('open');

@Component({
  selector: 'posts',
  controllerAs: 'Posts',
  template: require('./posts.html'),
  directives: [Table],
  providers: ['ui.tinymce']
})

@Inject('posts', ModalService)
export default class Posts extends TableComponent {
  @Resolve()
  static posts() {
    return Post.query();
  }

  constructor(posts, ModalService) {
    super(ModalService);

    this.fields = ['id', 'title', 'subheading', 'user', 'created_at', 'updated_at'];
    this.options.actions = ['add', 'preview', 'edit', 'delete', 'deleteAll'];
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
      object: new Post(),
      users: User.query()
    };
    this.modalService.addDialog(locals).then(::this.handleSubmit);
  }

  edit(event) {
    let post = this.getSelected();
    let locals = {
      action: 'Update',
      object: post,
      users: User.query()
    };
    this.modalService.edit(locals).then(::this.handleSubmit);
  }

  preview(event) {
    let post = this.getSelected();
    this.modalService.redirect().then(() => {
      open(`${CLIENT_URL}/${post.title_url}`);
    });
  }

  async handleSubmit(slug) {
    try {
      let action = slug.action;
      let postSlug = slug.objectSlug;
      if (action === 'Update') {
        let post = this.posts.filter(post => { return postSlug.id === post.id })[0];
        await post.save(postSlug);
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
