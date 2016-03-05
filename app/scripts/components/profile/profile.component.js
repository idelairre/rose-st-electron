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
    let headers = AuthenticationService.getHeaders();
    return User.get({ uid: headers.uid });
  }

  constructor(profile, AuthenticationService, ModalService) {
    this.authService = AuthenticationService;
    this.modalService = ModalService;
    this.profile = profile;
    this.editProfile = new EventEmitter();
    this.editPost = new EventEmitter();
    this.resetPassword = new EventEmitter();

    this.editProfile.subscribe(::this.openProfileModal);
    this.editPost.subscribe(::this.openPostModal);
    this.resetPassword.subscribe(::this.openResetPasswordModal);
  }

  // this is contrived, but it gets around some fucking awful bugs in angular material at the moment

  editPostAction(post) {
    this.editPost.next(post);
  }

  editProfileAction(event) {
    this.editProfile.next();
  }

  resetPasswordAction() {
    this.resetPassword.next();
  }

  openProfileModal() {
    let locals = {
      action: 'Update',
      object: this.profile
    };
    this.modalService.edit(locals).then(::this.handleSubmit);
  }

  openPostModal(post) {
    let locals = {
      action: 'Update',
      object: new Post(post)
    };
    this.modalService.edit(locals).then(::this.handleSubmit);
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

  handleSubmit(slug) {
    console.log(slug);
    let userSlug = slug.objectSlug;
    try {
      // new User(userSlug);
    } catch (error) {
      this.handleErrors(error);
    }
  }
}
