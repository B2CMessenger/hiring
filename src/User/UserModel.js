import _ from 'underscore';
import { Model, ajax } from '@say2b/backbone';
import settings from '../settings';

@Model.properties({
    url: settings.host + '/authorize',
    idAttribute: 'name',

    defaults: {
        /*...*/
    },

    computeds: {
        isLoggedIn: {
            deps: ['token'],
            get: token => !!token
        }
    }
})
class UserModel extends Model {
    /*...*/

    validate(attributes) {
        /*...*/
    }
}

export default UserModel;