import { Injectable, Inject } from 'ng-forward';
import Auth from 'j-toker';
import axios from 'axios';
import { SERVER_URL, REDIRECT_URL } from '../constants/constants';
import qs from 'qs';
import 'babel-polyfill';

@Injectable()
@Inject('$window')
export default class AuthenticationService {
  constructor($window) {
    this.$window = $window;
  	this.auth = Auth.configure({
  		apiUrl: SERVER_URL,
  		storage: 'localStorage',
  		cookieExpiry: 14,
  		cookiePath: '/',
  		passwordResetSuccessUrl: () => {
  			return window.location.href.replace(/#.*/g, '');
  		}
  	});
    this.user = Auth.user;
  }

  evalAdmin() {
    return Auth.user.admin;
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
      let response = await Auth.signOut();
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
    console.log(credentials);
    return Auth.requestPasswordReset({ email: credentials.email });
  }

  async getOauthTokens(url) {
    let response = await axios.get(url);
    return response;
  }

  // NOTE: these have scary names so they will never be used instead of Auth methods

  async getTokenAfterPasswordReset(params) {
    let serializedParams = qs.stringify(params, {
      arrayFormat: 'brackets'
    });
  	try {
  		let response = await axios.get(`${SERVER_URL}/auth/password/edit?${serializedParams}`);
  		return response;
  	} catch (error) {
  		console.error(error);
  	}
  }

  setTokenAfterPasswordReset(params) {
    params = Auth.normalizeTokenKeys(params);
    let headers = Auth.buildAuthHeaders(params);
    Auth.persistData('authHeaders', headers);
    Auth.persistData('mustResetPassword', true);
    return Promise.resolve();
  }

  updatePassword(credentials) {
    return Auth.updatePassword(credentials);
  }

  updateAccount(user) {
    return Auth.updateAccount(user);
  }

  isAuthenticated() {
    return Auth.validateToken();
  }

  getUser() {
    return Auth.user;
  }
}
