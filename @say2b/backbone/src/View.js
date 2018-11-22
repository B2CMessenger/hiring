import _ from 'underscore';
import Marionette from 'backbone.marionette';
import { properties, extendProperties, options, events } from './decorators';

const View = Marionette.View;

_.assign(View, { properties, extendProperties, options, events });

export default View;