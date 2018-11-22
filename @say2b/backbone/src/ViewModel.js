import _ from 'underscore';
import Model from './Model';

const ViewModel = Model.extend({
    defaults: {
        disable: false,
        parentViewModel: null
    },
    proxies: {
        'parentViewModelDisabled': {
            modelAttribute: 'parentViewModel',
            submodelAttribute: 'disabled',
            readOnly: true
        }
    },
    computeds: {
        'disabled': {
            deps: ['disable', 'parentDisabled'],
            get: (disable, parentDisabled) => !!disable || !!parentDisabled,
            set: val => _.create(null, { disable: !!val })
        },
        'enabled': {
            deps: ['disabled'],
            get: (disabled) => !disabled,
            set: val => _.create(null, { disable: !val })
        },
        'parentDisabled': {
            deps: ['parentViewModel', 'parentViewModelDisabled', '_parentDisabled'],
            get: (parentViewModel, parentViewModelDisabled, _parentDisabled) => parentViewModel ?
                parentViewModelDisabled
                : _parentDisabled,
            set: val => ({ _parentDisabled: !!val })
        }
    }
}, {
    extend(props, classProps) {
        props = props || _.create(null);

        _.each(ViewModel, (v, k) => {
            if (_.isObject(v) && _.has(props, k)) {
                if (_.isFunction(props[k])) {
                    props[k] = function () {
                        return _.extend(v, props[k].apply(this, arguments));
                    }
                } else {
                    props[k] = _.extend(v, props[k]);
                }
            }
        });

        return Model.extend.call(this, props, classProps);
    }
});

export default ViewModel;