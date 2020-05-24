import {Ticket} from '@ans-exam/client/src/api';

import * as fs from 'fs';
import Chance from 'chance';

import data from './data.json';

export const tempData = data as Ticket[];

export function addTicket = (newTicket: string) => {

    let tempData = require('./data.json');
    tempData.unshift(newTicket);
    let temp = JSON.stringify(temp);
    fs.writeFileSync('./data.json', temp, null, 2);
     

}
