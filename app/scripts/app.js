import angular from 'angular';
import { bootstrap } from 'ng-forward';
import MainComponent from './components/main/main.component';
import AuthenticationConfig from './config/authentication.config';
import EventConfig from './config/event.config';
import HttpInterceptor from './config/http-interceptor.config';
import RemoteProviders from './config/remoteProviders.config';
import RouteConfig from './config/routes.config';
import MdThemeConfig from './config/mdtheme.config';
import Chart from 'chart.js/Chart.min';
import 'angular-animate';
import 'angular-electron';
import 'angular-material';
import 'angular-messages';
import 'angular-sanitize';
import 'angular-ui-router';
import 'mdPickers/dist/mdPickers.min';
import 'babel-polyfill';
import 'reflect-metadata';
import 'tc-angular-chartjs/dist/tc-angular-chartjs';

window['Chart'] = Chart;

bootstrap(MainComponent, [
  'angular-electron',
  'ngAnimate',
  'ngMessages',
  'ngMaterial',
  'ngSanitize',
  'mdPickers',
  'tc.chartjs',
  'ui.router',
  AuthenticationConfig.name,
  EventConfig.name,
  HttpInterceptor.name,
  RemoteProviders.name,
  RouteConfig.name,
  MdThemeConfig.name
]);
