import angular from 'angular';
import { bootstrap } from 'ng-forward';
import MainComponent from './components/main/main.component';
import AnalyticsConfig from './config/analytics.config';
import AuthenticationConfig from './config/authentication.config';
import EventConfig from './config/event.config';
import HttpInterceptor from './config/http-interceptor.config';
import RouteConfig from './config/routes.config';
import MdThemeConfig from './config/mdtheme.config';
import Chart from 'chart.js/Chart.min';
import 'angular-animate';
import 'angular-material';
import 'angular-messages';
import 'angular-ui-router';
import 'babel-polyfill';
import 'ngAnalytics/src/ng-analytics.min';
import 'reflect-metadata';
import 'tc-angular-chartjs/dist/tc-angular-chartjs.min';

window['Chart'] = Chart;

bootstrap(MainComponent, [
  'ngAnimate',
  'ngAnalytics',
  'ngMessages',
  'ngMaterial',
  'tc.chartjs',
  'ui.router',
  AnalyticsConfig.name,
  AuthenticationConfig.name,
  EventConfig.name,
  HttpInterceptor.name,
  RouteConfig.name,
  MdThemeConfig.name
]);
