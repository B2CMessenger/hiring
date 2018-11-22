import _ from 'underscore';
import { Optional, Required, ItemView, ViewModel } from '@say2b/backbone';

import template from './Editor.jade';
import './Editor.scss';

@ItemView.options({
    model: Required,
    parentViewModel: Optional
})
@ItemView.properties({
    tagName: 'form',
    template,
    className: 'editor-view',

    ui: {
        subject: '[data-js-subject]',
        text: '[data-js-text]',
        /*...*/
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
})
class EditorView extends ItemView {
    initialize() {
        this.viewModel = new ViewModel({
            parentViewModel: this.options.parentViewModel || null
        });
    }

    onDestroy() {
        this.viewModel.destroy();
    }
}

export default EditorView;