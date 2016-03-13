import { Inject } from 'ng-forward';
import 'reflect-metadata';

class AnalyticsConfig {
  @Inject('ngAnalyticsService')
  static run(ngAnalyticsService) {
    ngAnalyticsService.setClientId('323072685738-k19gtomqj9fp2cqid79lo68rte1q5sco.apps.googleusercontent.com'); // e.g. xxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
  }
}

export default angular.module('roseStAdmin.analytics', ['ngAnalytics']).run(AnalyticsConfig.run);
