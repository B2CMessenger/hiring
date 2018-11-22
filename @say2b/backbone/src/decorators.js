import _ from 'underscore';

function properties(value) {
    return function decorator(target) {
        _.extend(target.prototype, value);
    }
}

function extendProperties(value) {
    return function decorator(target) {
        _.each(value, (v, k) => {
            const proto = target.prototype[k];
            if (_.isUndefined(proto)) {
                target.prototype[k] = v;
            } else if (_.isFunction(proto)) {
                throw new Error(`cannot extend function ${target.name}.${k}`);
            } else if (_.isObject(proto)) {
                if (_.isFunction(v)) {
                    throw new Error(`cannot extend ${target.name}.${k} with function ${v.name}`);
                } else if (_.isObject(v)) {
                    _.extend(proto, v);
                } else {
                    throw new Error(`cannot extend ${target.name}.${k} with non-object ${JSON.stringify(v)}`);
                }
            } else {
                throw new Error(`cannot extend non-object ${target.name}.${k}`);
            }
        })
    }
}

function options(options) {
    return function decorator(target) {
        target.prototype.options = _.extend(target.prototype.options || {}, options);
    }
}

function events(events) {
    return function decorator(target) {}
}

export { properties, extendProperties, options, events }