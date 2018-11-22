import _ from 'underscore';
import { Optional, Required, ItemView, ViewModel } from '@say2b/backbone';

import template from './UserPanel.jade';
import './UserPanel.scss';

@ItemView.options({
    model: Required,
    parentViewModel: Optional
})
@ItemView.events({
    'add': () => { }
})
@ItemView.properties({
    /*...*/
    template,
    className: 'user-panel-view',

    ui: {
        add: '[data-js-add]',
        nameInput: '[data-js-name-input]',
        submit: '[data-js-submit]',
        name: '[data-js-user-name]'
    },

    computeds: {
        /*...*/
    },

    bindings: {
        /*...*/
    },

    events: {
        /*...*/
    },

    /*...*/
})
class UserPanelView extends ItemView {
    initialize() {
        this.viewModel = new ViewModel({
            parentViewModel: this.options.parentViewModel || null
        });
    }

    onDestroy() {
        this.viewModel.destroy();
    }
}

export default UserPanelView;