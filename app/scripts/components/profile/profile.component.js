import { Component, EventEmitter, Inject, Resolve } from 'ng-forward';
import AuthenticationService from '../../services/authentication.service';
import ModalService from '../../services/modal.service';
import Post from '../posts/post.model';
import User from '../users/user.model';
import 'angular-password';
import 'babel-polyfill';
import 'reflect-metadata';

@Component({
  selector: 'profile',
  controllerAs: 'Profile',
  template: require('./profile.html'),
  providers: ['ngPassword', AuthenticationService, ModalService]
})

@Inject('profile', AuthenticationService, ModalService)
export default class Profile {
  @Resolve()
  @Inject(AuthenticationService)
  static profile(AuthenticationService) {
    let user = new User(AuthenticationService.getUser());
    return user;
  }

  constructor(profile, AuthenticationService, ModalService) {
    this.authService = AuthenticationService;
    this.modalService = ModalService;
    this.user = profile;
    this.addPost = new EventEmitter();
    this.editField = new EventEmitter();
    this.editProfile = new EventEmitter();
    this.editPost = new EventEmitter();
    this.resetPassword = new EventEmitter();
    this.editProfile.subscribe(::this.openProfileModal);
    this.editField.subscribe(::this.openFieldModal);
    this.editPost.subscribe(::this.openPostModal);
    this.resetPassword.subscribe(::this.openResetPasswordModal);
    this.defaultFields = Object.assign({}, profile._meta_);
  }

  // this is contrived, but it gets around some fucking awful bugs in angular material at the moment
  editFieldAction(field) {
    this.resetFields();
    this.editField.next(field);
  }

  editPostAction(slug) {
    this.editPost.next(slug);
  }

  editProfileAction() {
    this.resetFields();
    this.editProfile.next();
  }

  resetPasswordAction() {
    this.resetPassword.next();
  }

  resetFields() {
    this.user._meta_ = Object.assign({}, this.defaultFields);
  }

  openFieldModal(field) {
    for (let key in this.user._meta_) {
      if (key !== field) {
        this.user._meta_[key] = 'hidden';
      }
    }
    let locals = {
      action: 'Update',
      object: this.user
    };
    return this.modalService.edit(locals).then(::this.handleSubmitUser);
  }

  openProfileModal() {
    this.resetFields();
    this.user._meta_.admin = 'hidden';
    this.user._meta_.confirmed = 'hidden';
    let locals = {
      action: 'Update',
      object: this.user
    };
    this.modalService.edit(locals).then(::this.handleSubmitUser);
  }

  openPostModal(slug) {
    slug.post = (typeof slug.post !== 'undefined' ? new Post(slug.post) : new Post());
    slug.post._meta_.user = 'hidden';
    let locals = {
      action: slug.action,
      object: slug.post
    };
    this.modalService.edit(locals).then(::this.handleSubmitPost);
  }

  openResetPasswordModal() {
    this.modalService.resetPassword();
  }

  handleErrors(error) {
    console.error(error);
    return this.modalService.hide().then(() => {
      this.modalService.error(error);
    });
  }

  handleSubmitPost(slug) {
    console.log(slug);
    let post = slug.objectSlug;
    try {
      post.user_id = this.user.id;
      post.save();
    } catch (error) {
      this.handleErrors(error);
    }
  }

  handleSubmitUser(slug) {
    let user = slug.objectSlug;
    try {
      user.save();
      this.user = user;
    } catch (error) {
      this.handleErrors(error);
    }
  }
}
