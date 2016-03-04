import Auth from 'j-toker';
import axios from 'axios';
import { SERVER_URL } from '../../constants/constants';
import 'babel-polyfill';
import 'reflect-metadata';

const DONATION_FIELDS = {
  id: 'string',
  amount: 'currency',
  fee: 'currency',
  net: 'currency',
  source: 'source',
  type: 'type',
  customer: 'string',
  subscriptions: 'array',
  available_on: 'date',
  created_at: 'date'
}

export default class Donation {
  constructor() {
    this.initialize(arguments, DONATION_FIELDS);
  }

  initialize(args, fields) {
    args = args[0] || {};
    for (let key in fields) {
      this[key] = (args[key] !== undefined) ? args[key] : undefined;
    }
  }

  static async get(path) {
    try {
      let response = await axios.get(`${SERVER_URL}/donations/${path}`, { params: Auth.retrieveData('authHeaders') });
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }

  static async listCharges() {
    return Donation.get('charges');
  }

  static async listCustomers() {
    return Donation.get('customers');
  }

  static async listSubscriptions() {
    return Donation.get('subscriptions');
  }

  static async listTransactions() {
    return Donation.get('transactions');
  }

  static getInstance() {
    Donation.instance = new Donation();
    return Donation.instance;
  }
}
