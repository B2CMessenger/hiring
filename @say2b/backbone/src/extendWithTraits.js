import _ from 'underscore';
import Marionette from 'backbone.marionette';
import Trait from './Trait.js'

export function extend(...args) {
    return extendWithTraits.call(this, null, ...args);
}

export default function extendWithTraits(traits, props, classProps, replaceExtend) {
    const Parent = this;

    props = _.defaults(props || (props = _.create(null)), {
        super: Parent.prototype
    });

    if (replaceExtend) {
        classProps = _.defaults(classProps || (classProps = _.create(null)), {
            extend,
            extendWithTraits
        });
    }

    const Type = Marionette.extend.call(Parent, props, classProps);

    if (traits) {
        let rewriteConstructor = false;
        traits = _.filter(traits, v => {
            if (v instanceof Trait) {
                v.applyTo(Type.prototype);
                return false;
            } else if (v.prototype instanceof Trait || v.Trait && v.Trait.prototype instanceof Trait) {
                rewriteConstructor = true;
                return true;
            }
        });

        if (rewriteConstructor) {
            function Child() {
                _.each(traits, v => {
                    let trait;
                    if (v.prototype instanceof Trait) {
                        trait = new v;
                    } else if (v.Trait && v.Trait.prototype instanceof Trait) {
                        const options = _.isFunction(v.options) ? v.options.apply(this, arguments) : v.options;
                        trait = new (v.Trait)(options);
                    }

                    if (trait) trait.applyTo(this);
                });

                return Type.apply(this, arguments);
            };
            
            _.extend(Child, Type);

            Child.prototype = _.create(Type.prototype);
            Child.prototype.constructor = Child;

            return Child;
        }
    }

    return Type;
};