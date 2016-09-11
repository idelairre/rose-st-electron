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
			return await Auth.signOut();;
		} catch (error) {
			console.error(error);
		}
	}

	register(credentials) {
		return Auth.emailSignUp(credentials);
	}

	resetPassword(credentials) {
		return Auth.requestPasswordReset({
			email: credentials.email
		});
	}

	async getOauthTokens(url) {
		return await axios.get(url);
	}

	// NOTE: these have scary names so they will never be used instead of Auth methods

	async getTokenAfterPasswordReset(params) {
		const serializedParams = qs.stringify(params, {
			arrayFormat: 'brackets'
		});
		try {
			return await axios.get(`${SERVER_URL}/auth/password/edit?${serializedParams}`);
		} catch (error) {
			console.error(error);
		}
	}

	setTokenAfterPasswordReset(params) {
		params = Auth.normalizeTokenKeys(params);
		const headers = Auth.buildAuthHeaders(params);
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
		if (Auth.user.id) {
      const { user } = Auth;
      localStorage.setItem('user', JSON.stringify(user));
      return user;
		} else {
      return JSON.parse(localStorage.getItem('user'));
		}
	}
}
