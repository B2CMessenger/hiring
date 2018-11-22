export default class Trait {
    constructor(id) {
        this.id = id || Symbol();
        this.options = {};
        this.parentOptions = {};
        this.methods = {};
        this.events = {};
        this.bindings = {};
        this._checkMethods();
    };

    _checkMethods() {
        _.each(
            [
                'initialize',
                'fetch', 'set',
                'onRender', 'onAttach'
            ],
            m => {
                if (_.isFunction(this[m])) {
                    this.methods[m] = this[m];
                }
            }
        );
    };

    _resultOption(optionName, options) {
        _.defaults(options || (options = {}), {
            attributeName: optionName,
            allowStringAsSelector: false,
            allowStringAsRegionName: false,
        });

        if (!optionName) return;

        const option = this.options[optionName];
        if (_.isFunction(option)) {
            Object.defineProperties(this, {
                [options.attributeName]: {
                    get: () => option.call(this.o)
                },
            });
        } else if (_.isString(option)) {
            if (options.allowStringAsSelector) {
                Object.defineProperties(this, {
                    [options.attributeName]: {
                        get: () => this.o.$el.find(this.o.normalizeUIValues([option])[0])
                    }
                });
            } else if (options.allowStringAsRegionName) {
                Object.defineProperties(this, {
                    [options.attributeName]: {
                        get: () => this.o[option]
                    }
                });
            }
        } else {
            Object.defineProperties(this, {
                [options.attributeName]: {
                    value: option
                }
            });
        }
    };

    applyTo(o, ...args) {
        const trait = this;
        if (_.size(trait.parentOptions)) {
            _.defaults(o.options || (o.options = {}), trait.parentOptions);
        }

        if (_.size(trait.regions)) {
            _.extend(o.events || (o.events = {}), trait.regions);
        }

        if (_.size(trait.events)) {
            _.extend(o.events || (o.events = {}), trait.events);
        }

        if (_.size(trait.bindings)) {
            _.extend(o.bindings || (o.bindings = {}), trait.bindings);
        }

        _.each(this.methods, (f, name) => {
            if (_.isFunction(f)) {
                const original = o[name];
                o[name] = function (...args) {
                    return f.call(this, original, trait, ...args);
                }
            }
        });

        Object.defineProperties(this, {
            o: {
                value: o
            }
        });

        Object.defineProperties(o, {
            [trait.id]: {
                value: trait
            }
        });

        return o;
    };
};