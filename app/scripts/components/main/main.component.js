import { Component, StateConfig } from 'ng-forward';
import Analytics from '../analytics/analytics.component';
import Donations from '../donations/donations.component';
import Home from '../home/home.component';
import Password from '../auth/password/password.component';
import Posts from '../posts/posts.component';
import Profile from '../profile/profile.component';
import Registration from '../auth/registration/registration.component';
import Nav from '../nav/nav.component';
import Messages from '../messages/messages.component';
import Login from '../auth/login/login.component';
import Users from '../users/users.component';
import uiRouter from 'angular-ui-router';
import 'babel-polyfill';
import 'reflect-metadata';

@StateConfig([
  { url: '/', name: 'home', component: Home },
  { url: '/analytics', name: 'analytics', component: Analytics },
  { url: '/posts', name: 'posts', component: Posts },
  { url: '/profile', name: 'profile', component: Profile },
  { url: '/users', name: 'users', component: Users },
  { url: '/login', name: 'login', component: Login },
  { url: '/registration', name: 'registration', component: Registration },
  { url: '/password/', name: 'password', component: Password },
  { url: '/messages', name: 'messages', component: Messages },
  { url: '/donations', name: 'donations', component: Donations }
])

@Component({
	selector: 'rose-st-admin',
	template: require('./main.html'),
	providers: [uiRouter],
	directives: [Nav]
})

export default class MainComponent { }
