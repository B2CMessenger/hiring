import _ from 'underscore';
import Backbone from 'backbone';
import extend from './extend';
import { properties } from './decorators';

const Collection = extend.call(Backbone.Collection, {
    constructor: function(models, options) {
        this.options = _.extend({}, _.result(this, 'options'), options);
        return Backbone.Collection.apply(this, arguments);
    },
}, null, true);

Collection.properties = properties;

export default Collection;