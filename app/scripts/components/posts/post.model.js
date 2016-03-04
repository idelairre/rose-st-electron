import Model from '../../model/model';

const POST_FIELDS = {
  id: 'hidden',
  title: 'string',
  title_url: 'hidden',
  body: 'text',
  user: 'user',
  user_id: 'hidden',
  subheading: 'string',
  created_at: 'date',
  updated_at: 'date'
};

export default class Post extends Model {
  constructor() {
    console.log(arguments);
    super();
    super.initialize(arguments, POST_FIELDS);
  }

  static getInstance() {
    Post.instance = new Post();
    return Post.instance;
  }
}
