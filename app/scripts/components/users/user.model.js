import Model from '../../model/model';

const USER_FIELDS = {
  id: 'hidden',
  email: 'string',
  confirmed: 'hidden',
  nickname: 'string',
  name: 'string',
  password: 'password',
  admin: 'boolean',
  posts: 'array',
  sign_in_count: 'hidden',
  created_at: 'date',
  updated_at: 'date'
}

export default class User extends Model {
  constructor() {
    super();
    super.initialize(arguments, USER_FIELDS);
  }

  static getInstance() {
    User.instance = new User();
    return User.instance;
  }
}
