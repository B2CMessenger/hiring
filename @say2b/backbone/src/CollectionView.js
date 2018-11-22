import _ from 'underscore';
import Marionette from 'backbone.marionette';
import epoxify from './epoxify';

const CollectionView = epoxify.call(Marionette.CollectionView, {
    _renderChildren() {
        this.removeBindings();
        if (_.isObject(this.bindings)) {
            this.bindings = _(_.result(this, 'bindings')).reduce((memo, val, key) => _(memo).extend({ [key.replace(/@ui\.([a-zA-Z0-9_\.]+)/, (s, name) => this._uiBindings[name])]: val }), {});
        }
        this.applyBindings();
        return Marionette.CollectionView.prototype._renderChildren.apply(this, arguments);
    }
});

export default CollectionView;