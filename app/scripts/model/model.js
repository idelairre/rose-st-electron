import Auth from 'j-toker';
import axios from 'axios';
import { SERVER_URL } from '../constants/constants';
import 'babel-polyfill';
import 'reflect-metadata';

let inflect = require('i')();

export default class Model {
  constructor() {
    this._route = `${inflect.pluralize(this.constructor.name.toLowerCase())}`;

  }

  assignProps(params) {
    if (params === undefined) {
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
    console.log('initializing...');
    args = args[0] || {};
    for (let key in fields) {
      this[key] = (args[key] !== undefined) ? args[key] : undefined;
    }
    if (this.initialized(fields)) { // this seems bogus, the purpose of this is to make sure that dummy instances are not posted
      this.save();
    }
    this._meta_ = fields;
    console.log(this, this.initialized(fields));
  }

  initialized(fields) {
    let undefinedCount = 0;
    fields = Object.keys(fields);
    fields.map(field => {
      if (this[field] === undefined) {
        undefinedCount += 1;
      }
    });
    if (undefinedCount === fields.length) {
      return false;
    }
    return true;
  }

  async save(data) {
    console.log(data);
    debugger;
    try {
      const OBJ = this.constructor.name.toLowerCase();
      if (!data) {
        let params = {};
        params[OBJ] = this;
        let response = await axios.post(`${SERVER_URL}/${this._route}/`, Object.assign(params, Auth.retrieveData('authHeaders')));
        console.log(response);
        this.assignProps(response.data);
        return Promise.resolve(this);
      } else if (data.id) {
        let params = {};
        params[OBJ] = data;
        let response = await axios.put(`${SERVER_URL}/${this._route}/${this.id}`, Object.assign(params, Auth.retrieveData('authHeaders')));
        this.assignProps(response.data);
        return Promise.resolve(this);
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
