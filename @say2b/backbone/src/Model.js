import _ from 'underscore';
import Epoxy from 'backbone.epoxy';
import extend from './extend';
import { properties, extendProperties } from './decorators';

const proxy = Symbol("proxies container");

const ProxyModel = extend.call(Epoxy.Model, {
    constructor: function (attributes, options) {
        _.extend(this, _.pick(options || {}, ['proxies']));

        var initialize = this.initialize;
        this.initialize = _.noop;

        const r = Epoxy.Model.prototype.constructor.apply(this, arguments);
        this.initProxies(attributes, options);

        this.options = _.extend({}, _.result(this, 'options'), options);
        initialize.apply(this, arguments);

        return r;
    },

    destroy(options) {
        options = options ? _.clone(options) : {};
        var model = this;
        var success = options.success;
        var wait = options.wait;

        var destroy = function () {
            model.clearComputeds({ saveComputedValuesAsAttributes: options.saveComputedValuesAsAttributes });
            model.stopListening();
            model.trigger('destroy', model, model.collection, options);
        };

        options.success = function (resp) {
            if (wait) destroy();
            if (success) success.call(options.context, model, resp, options);
            if (!model.isNew()) model.trigger('sync', model, resp, options);
        };

        var xhr = false;
        if (this.isNew()) {
            _.defer(options.success);
        } else {
            var error = options.error;
            options.error = function (resp) {
                if (error) error.call(options.context, model, resp, options);
                model.trigger('error', model, resp, options);
            };
            xhr = this.sync('delete', this, options);
        }
        if (!wait) destroy();
        return xhr;
    },

    toJSON(options) {
        if (options && options.onlyComputed) {
            return _.reduce(this.c(), (json, computed, attribute) => {
                json[attribute] = computed.value;
                return json;
            }, {});
        } else {
            return Epoxy.Model.prototype.toJSON.apply(this, arguments);
        }
    },

    clearComputeds(options) {
        const saveComputedValuesAsAttributes = options && options.saveComputedValuesAsAttributes;

        _.each(this.c(), (computed, attribute) => { 
            if (saveComputedValuesAsAttributes) {
                this.attributes[attribute] = computed.value;
            }
            this.removeComputed(attribute);
        })
        
        return this;
    },

    initProxies(attributes, options) {
        this[proxy] = {};

        _.each(this.proxies, (params, name) => {
            this.addProxyAttribute(name, params.modelAttribute, params.submodelAttribute || name, params.readOnly);
        });
    },

    addProxyAttribute(name, modelKey, key, readOnly = false) {
        this.removeProxyAttribute(name);

        const watcher = '_proxy_watcher_' + _.uniqueId();
        this.addComputed(name, _.extend(
            {
                deps: [modelKey, watcher],
                get(model) {
                    if (model) {
                        return model.get && model.get(key);
                    } else {
                        return undefined;
                    }
                }
            },
            (readOnly ? undefined :
                {
                    set(val) {
                        const model = this.get(modelKey);
                        if (model) {
                            model.set(key, val);
                        }
                    }
                }
            )
        ));

        const trigger = () => {
            this.set(watcher, _.uniqueId());
        };

        const watch = () => {
            const previous = this.previous(modelKey);
            if (previous) {
                this.stopListening(previous, `change:${key}`, trigger);
            }

            const model = this.get(modelKey);
            if (model) {
                this.listenTo(model, `change:${key}`, trigger);
            }
        };

        this.on(`change:${modelKey}`, watch);

        this[proxy][name] = {
            trigger, watch,
            modelKey, key,
            watcher
        };

        watch();
    },

    removeProxyAttribute(name) {
        const params = this[proxy][name];
        if (params) {
            const modelKey = params.modelKey,
                key = params.key,
                trigger = params.trigger,
                watch = params.watch,
                watcher = params.watcher;

            this.off(`change:${modelKey}`, watch);

            const model = this.get(modelKey);
            if (model) {
                this.stopListening(model, `change:${key}`, trigger);
            }

            this.removeComputed(name);
            this.unset(watcher);
        }
    },
}, {
    properties,
    extendProperties
}, true);

export default ProxyModel;