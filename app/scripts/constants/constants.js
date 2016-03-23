import { version } from '../../../package.json';
import path from 'path';

export const SERVER_URL = 'https://rose-st-api.herokuapp.com';

export const VERSION = version;

export const CLIENT_URL = 'http://rose-st-client.herokuapp.com';

export const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export const HOURS = ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00','22:00','23:00'];

export const HOURS_APM = ['1:00am', '2:00am', '3:00am', '4:00am', '5:00am', '6:00am', '7:00am', '8:00am', '9:00am', '10:00am', '11:00am', '12:00am', '1:00pm', '2:00pm', '3:00pm','4:00pm','5:00pm','6:00pm','7:00pm','8:00pm','9:00pm','10:00pm','11:00pm','12:00pm'];

export const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

export const DATE = new Date();

export const TODAY = [DATE.getFullYear(), DATE.getMonth(), DATE.getDate(), 12];

export const YEAR_START = [DATE.getFullYear(), 0, 1, 1];

export const APP_DIR = path.normalize(path.resolve(__dirname, '../..')).replace(/file:\//g, '');
