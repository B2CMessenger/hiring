import _ from 'underscore';
import Epoxy from 'backbone.epoxy';
import extend from './extend';
import extendWithTraits from './extendWithTraits';
import { properties, extendProperties, options, events } from './decorators';

export function epoxify(Class) {
    function Epoxied(options) {
        this.options = _.extend({
            autoApplyingEpoxyBindings: true,
            autoBindNotBubblingEvents: false,
        }, _.result(this, 'options'), options);

        _.extend(this, _.pick(this.options,
            ['viewModel', 'bindings', 'bindingFilters', 'bindingHandlers', 'bindingSources', 'computeds']
        ));

        Class.apply(this, arguments);

        this.bindEntityEvents(this.viewModel, this.getOption('viewModelEvents'));

        _.each(this._behaviors,
            (behavior) => behavior.bindEntityEvents(this.viewModel, behavior.getOption('viewModelEvents')));

        this.triggerMethod('construct');
    }

    Epoxied.prototype = _.create(Class.prototype);
    _.extend(Epoxied.prototype, Epoxy.View.mixin(), {
        _bindUIElements() {
            if (!this.ui) { return }

            if (!this._uiBindings) {
                this._uiBindings = this.ui;
            }

            const bindings = _.result(this, '_uiBindings');

            this.ui = {};

            _.each(bindings, function (selector, key) {
                if (!selector) {
                    this.ui[key] = this.$el;
                } else {
                    this.ui[key] = this.$(selector);
                }
            }, this);
        },

        applyBindings() {
            if (_.isObject(this.bindings)) {
                this.bindings = _.reduce(
                    _.result(this, 'bindings'),
                    (memo, val, key) =>
                        (memo[key.replace(/@ui\.([a-zA-Z0-9_\.]+)/, (s, name) => this._uiBindings[name])] = val, memo),
                    {}
                );
            }
            return Epoxy.View.prototype.applyBindings.apply(this, arguments);
        },

        bindUIElements() {
            Class.prototype.bindUIElements.apply(this, arguments);

            if (this.options.autoApplyingEpoxyBindings) {
                this.applyBindings();
            }

            if (this.options.autoBindNotBubblingEvents) {
                const delegateEventSplitter = /^(\S+)\s*(.*)$/,
                    events = _.result(this, 'events');

                for (let key in events) {
                    let method = events[key];
                    if (!_.isFunction(method)) method = this[method];
                    if (!method) continue;

                    const match = key.match(delegateEventSplitter),
                        eventName = match[1],
                        selector = match[2];

                    if (eventName == 'scroll') {
                        this.$el.find(selector).off(eventName + '.directEvents' + this.cid);
                        this.$el.find(selector).on(eventName + '.directEvents' + this.cid, _.bind(method, this));
                    }
                }
            }
        },

        unbindUIElements() {
            this.removeBindings();
            Class.prototype.unbindUIElements.apply(this, arguments);

            if (this.options.autoBindNotBubblingEvents) {
                const delegateEventSplitter = /^(\S+)\s*(.*)$/,
                    events = _.result(this, 'events');

                for (let key in events) {
                    let method = events[key];
                    if (!_.isFunction(method)) method = this[method];
                    if (!method) continue;

                    const match = key.match(delegateEventSplitter),
                        eventName = match[1],
                        selector = match[2];

                    if (eventName == 'scroll') {
                        this.$el.find(selector).off(eventName + '.directEvents' + this.cid);
                    }
                }
            }
        },

        serializeModel(model) {
            return model.toJSON({ computed: true });
        }
    });

    Epoxied.prototype.constructor = Epoxied;

    _.assign(Epoxied, {
        extend,
        extendWithTraits,
        properties, extendProperties, options, events
    }, Class);

    return Epoxied;
}

export default function (props, classProps) {
    const parent = this;

    props = _.defaults(props || (props = _.create(null)), {
        _bindUIElements() {
            if (!this.ui) { return; }

            if (!this._uiBindings) {
                this._uiBindings = this.ui;
            }

            const bindings = _.result(this, '_uiBindings');

            this.ui = {};

            _.each(bindings, function (selector, key) {
                if (!selector) {
                    this.ui[key] = this.$el;
                } else {
                    this.ui[key] = this.$(selector);
                }
            }, this);
        },

        bindUIElements() {
            parent.prototype.bindUIElements.apply(this, arguments);
            if (_.isObject(this.bindings)) {
                this.bindings = _(_.result(this, 'bindings'))
                    .reduce((memo, val, key) =>
                        _(memo).extend({
                            [key.replace(/@ui\.([a-zA-Z0-9_\.]+)/, (s, name) => this._uiBindings[name])]: val
                        }), {}
                    );
            }
            if (this.options.autoApplyingEpoxyBindings) {
                this.applyBindings();
            }

            if (this.options.autoBindNotBubblingEvents) {
                const delegateEventSplitter = /^(\S+)\s*(.*)$/,
                    events = _.result(this, 'events');

                for (let key in events) {
                    let method = events[key];
                    if (!_.isFunction(method)) method = this[method];
                    if (!method) continue;

                    const match = key.match(delegateEventSplitter),
                        eventName = match[1],
                        selector = match[2];

                    if (eventName == 'scroll') {
                        this.$el.find(selector).off(eventName + '.directEvents' + this.cid);
                        this.$el.find(selector).on(eventName + '.directEvents' + this.cid, _.bind(method, this));
                    }
                }
            }
        },

        unbindUIElements() {
            this.removeBindings();
            parent.prototype.unbindUIElements.apply(this, arguments);

            if (this.options.autoBindNotBubblingEvents) {
                const delegateEventSplitter = /^(\S+)\s*(.*)$/,
                    events = _.result(this, 'events');

                for (let key in events) {
                    let method = events[key];
                    if (!_.isFunction(method)) method = this[method];
                    if (!method) continue;

                    const match = key.match(delegateEventSplitter),
                        eventName = match[1],
                        selector = match[2];

                    if (eventName == 'scroll') {
                        this.$el.find(selector).off(eventName + '.directEvents' + this.cid);
                    }
                }
            }
        },

        serializeModel(model) {
            return model.toJSON({ computed: true });
        }
    });

    if (!_.has(props, 'constructor')) _.extend(props, {
        constructor: function (options) {
            this.options = _.extend({
                autoApplyingEpoxyBindings: true,
                autoBindNotBubblingEvents: false,
            }, _.result(this, 'options'), options);

            _.extend(this, _.pick(this.options,
                ['viewModel', 'bindings', 'bindingFilters', 'bindingHandlers', 'bindingSources', 'computeds']
            ));

            parent.apply(this, arguments);
            Epoxy.View.mixin(this);

            this.bindEntityEvents(this.viewModel, this.getOption('viewModelEvents'));
            _.each(this._behaviors, function (behavior) {
                behavior.bindEntityEvents(this.viewModel, behavior.getOption('viewModelEvents'));
            }, this);

            if (_.isFunction(props._afterContructor)) {
                props._afterContructor.apply(this, arguments);
            }
        },
    });

    classProps = _.defaults(classProps
        || (classProps = _.pick(parent, 'bindings', 'bindingFilters', 'bindingHandlers', 'bindingSources', 'computeds')),
        {
            bindings: function bindings(value) {
                return function decorator(target) {
                    target.prototype.bindings = value;
                }
            },
            bindingFilters: function bindingFilters(value) {
                return function decorator(target) {
                    target.prototype.bindingFilters = value;
                }
            },
            bindingHandlers: function bindingHandlers(value) {
                return function decorator(target) {
                    target.prototype.bindingHandlers = value;
                }
            },
            bindingSources: function bindingSources(value) {
                return function decorator(target) {
                    target.prototype.bindingSources = value;
                }
            },
            computeds: function computeds(value) {
                return function decorator(target) {
                    target.prototype.computeds = value;
                }
            },
            properties, extendProperties, options, events
        }
    );

    return extend.call(parent, props, classProps, true);
}