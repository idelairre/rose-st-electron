import Auth from 'j-toker';
import axios from 'axios';
import { SERVER_URL } from '../constants/constants';
import 'babel-polyfill';
import 'reflect-metadata';

const inflect = require('inflected');

export default class Model {
  constructor() {
    this._route = `${inflect.pluralize(this.constructor.name.toLowerCase())}`;
  }

  assignProps(params) {
    if (typeof params === 'undefined') {
      return;
    }
    for (let key in params) {
      if (this.hasOwnProperty(key)) {
        this[key] = params[key];
      }
    }
    return this;
  }

  delete() {
    return axios.delete(`${SERVER_URL}/${this._route}/${this.id}`, { params : Auth.retrieveData('authHeaders') });
  }

  initialize(args, fields) {
    args = args[0] || {};
    for (let key in fields) {
      this[key] = (typeof args[key] !== 'undefined') ? args[key] : undefined;
    }
    if (this.initialized(fields) && typeof this.id === 'undefined') { // NOTE: this causes trouble, this seems bogus, the purpose of this is to make sure that dummy instances are not posted
      this.save(this);
    }
    this._meta_ = fields;
  }

  initialized(fields) {
    let undefinedCount = 0;
    fields = Object.keys(fields);
    fields.map(field => {
      if (typeof this[field] === 'undefined') {
        undefinedCount += 1;
      }
    });
    if (undefinedCount === fields.length) {
      return false;
    }
    return true;
  }

  static async get(param) {
  	try {
  		let response = await axios.get(`${SERVER_URL}/${this.getInstance()._route}/${param}`, {
        headers: Auth.retrieveData('authHeaders')
      });
      console.log(response.data);
      let item = this.getInstance().assignProps(response.data);
      return Promise.resolve(item);
  	} catch (error) {
  		console.error(error);
      return Promise.reject(error);
  	}
  }

  async save(data) {
    try {
      const OBJ = this.constructor.name.toLowerCase();
      let params = {};
      if (typeof data === 'undefined') {
        params[OBJ] = this;
        let response = await axios.patch(`${SERVER_URL}/${this._route}/${this.id}`, Object.assign(params, Auth.retrieveData('authHeaders')));
        this.assignProps(response.data);
        return Promise.resolve(this);
      } else {
        params[OBJ] = data;
        let response = await axios.post(`${SERVER_URL}/${this._route}/`, Object.assign(params, Auth.retrieveData('authHeaders')));
        this.assignProps(response.data);
        return Promise.resolve(response.data);
      }
    } catch (error) {
      Promise.reject(error);
    }
  }

  static async query() {
    try {
      let response = await axios.get(`${SERVER_URL}/${this.getInstance()._route}`, { params: Auth.retrieveData('authHeaders') });
      let items = response.data.map(item => {
        return this.getInstance().assignProps(item);
      });
      return Promise.resolve(items);
    } catch (error) {
      return Promise.reject(error);
    }
  }
}
