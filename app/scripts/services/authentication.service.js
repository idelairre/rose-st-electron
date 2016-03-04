import { Injectable, Inject } from 'ng-forward';
import Auth from 'j-toker';
import { SERVER_URL } from '../constants/constants';
import 'babel-polyfill';

@Injectable()
export default class AuthenticationService {
  constructor($mdDialog) {
    Auth.configure({
      apiUrl: SERVER_URL,
      storage: 'localStorage',
      cookieExpiry: 14,
      cookiePath: '/'
    });
  }

  getHeaders() {
    return Auth.retrieveData('authHeaders');
  }

  async login(credentials, config) {
    try {
      let response = await Auth.emailSignIn(credentials, config);
      return Promise.resolve(response);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async logout() {
    try {
      let response = await auth.signOut();
      console.log('logged out: ', response);
      return response;
    } catch (error) {
      console.error(error);
    }
  }

  register(credentials) {
    console.log(credentials);
    return Auth.emailSignUp(credentials);
  }

  resetPassword(credentials) {
    return Auth.requestPasswordReset(credentials.email);
  }

  isAdmin() {
    return Auth.user.isAdmin;
  }

  isAuthenticated() {
    return Auth.validateToken();
  }
}
