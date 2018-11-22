import _ from 'underscore';
import { Backbone, ajax } from '@say2b/backbone';
import App from './App/App';
import $ from 'jquery';

import './index.scss';

window.$ = $;
window.jQuery = $;

window.app = new App;

Backbone.ajax = function(options) {
    options = options || {};
    if (app.userModel.get('isLoggedIn')) {
        options.headers = _.defaults(options.header || (options.headers = {}), {
            token: app.userModel.get('token')
        })
    }
    return ajax(options);
}

window.app.start();

