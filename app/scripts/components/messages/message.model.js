import Model from '../../model/model';

const MESSAGE_FIELDS = {
  id: 'hidden',
  name: 'string',
  email: 'string',
  message: 'string',
  created_at: 'date',
  updated_at: 'date'
};

export default class Message extends Model {
  constructor() {
    super();
    super.initialize(arguments, MESSAGE_FIELDS);
  }

  static getInstance() {
    Message.instance = new Message();
    return Message.instance;
  }
}
