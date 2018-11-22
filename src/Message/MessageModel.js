import _ from 'underscore';
import { Model, Backbone } from '@say2b/backbone';
import settings from '../settings';
import AjaxError from '../AjaxError';

@Model.properties({
    /*...*/
})
class MessageModel extends Model {
    /*...*/

    async increaseCharge() {
        return new Promise((resolve, reject) => { 
            /*...*/
        });
    }

    async decreaseCharge() {
        return new Promise((resolve, reject) => {
            /*...*/
        });
    }

    async setCharge(charge) {
        charge = Math.max(0, Math.min(charge, 10));
        /*...*/
    }
}

export default MessageModel;