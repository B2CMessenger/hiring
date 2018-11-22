import './Error.toJSON';

import _ from 'underscore';
import Backbone from 'backbone';
import Marionette from 'backbone.marionette';
import { properties, extendProperties, options, events } from './decorators';

const Events = Backbone.Events,
    Application = Marionette.Application,
    history = Backbone.history,
    Router = Marionette.AppRouter,
    View = Marionette.View;
import Trait from './Trait';
import extendWithTraits from './extendWithTraits';
import extend from './extend';
import ItemView from './ItemView';
import LayoutView from './LayoutView';
import CollectionView from './CollectionView';
import CompositeView from './CompositeView';
import Model from './Model';
import Collection from './Collection';
import ViewModel from './ViewModel';
import DeferredPromise from './DeferredPromise';

const ajax = Backbone.ajax;

const Required = null;
const Optional = false;

export {
    Backbone, Marionette,
    Required, Optional,
    $, ajax,
    Events,
    Application,
    Router,
    history,
    Trait,
    extendWithTraits, extend,
    View, ItemView, LayoutView, CollectionView, CompositeView,
    Model, Collection, ViewModel,
    DeferredPromise,
    properties, extendProperties, options, events
};
