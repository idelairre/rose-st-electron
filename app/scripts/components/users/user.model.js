import Model from '../../model/model';

const USER_FIELDS = {
  id: 'hidden',
  email: 'string',
  nickname: 'string',
  password: 'password',
  isAdmin: 'boolean',
  posts: 'array',
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
