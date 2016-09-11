import { Inject, Injectable } from 'ng-forward';
import 'reflect-metadata';

@Injectable()
@Inject('googleapis')
export default class AnalyticsService {
  constructor(googleapis) {
    this.google = googleapis;
  }

  request(params) {
    return new Promise((resolve, reject) => {
      this.google.auth.getApplicationDefault((err, authClient) => {
        if (err) {
          reject(err);
        }
        if (authClient.createScopedRequired && authClient.createScopedRequired()) {
          authClient = authClient.createScoped(['https://www.googleapis.com/auth/analytics']);
        }
        this.analytics = this.analytics || this.google.analytics({
          version: 'v3',
          auth: authClient
        });
        this.analytics.data.ga.get(params, (err, response) => {
          if (err) {
            console.error(err);
            reject(err);
          }
          console.log(response);
          resolve(response);
        });
      });
    });
  }
}
