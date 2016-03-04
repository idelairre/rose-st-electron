import { Component, StateConfig } from 'ng-forward';
import Donations from '../donations/donations.component';
import Home from '../home/home.component';
import Posts from '../posts/posts.component';
import Nav from '../nav/nav.component';
import Messages from '../messages/messages.component';
import Login from '../auth/login/login.component';
import Users from '../users/users.component';
import uiRouter from 'angular-ui-router';
import 'babel-polyfill';
import 'reflect-metadata';

@StateConfig([
  { url: '/', name: 'home', component: Home },
  { url: '/posts', name: 'posts', component: Posts },
  { url: '/users', name: 'users', component: Users },
  { url: '/login', name: 'login', component: Login },
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
