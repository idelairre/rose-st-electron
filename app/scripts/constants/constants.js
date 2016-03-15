import { version } from '../../../package.json';
import path from 'path';

export const SERVER_URL = 'https://rose-st-api.herokuapp.com';

export const VERSION = version;

export const CLIENT_URL = 'http://rose-st-client.herokuapp.com';

let appPath = path.normalize(path.resolve(__dirname, '../..')).replace(/file:\//g, '');

export const APP_DIR = appPath;
