import _ from 'underscore';
import { Optional, Required, ItemView, ViewModel } from '@say2b/backbone';
import prettyColor from '../utils/randomPrettyColor';

import template from './Message.jade';
import './Message.scss';

@ItemView.options({
    model: Required,
    userModel: Required,
    parentViewModel: Optional
})
@ItemView.events({
    'edit': (messageModel) => { }
})
@ItemView.properties({
    template,
    className: 'message-view',

    ui: {
        avatar: '[data-js-avatar]',
        author: '[data-js-author]',
        date: '[data-js-date]',
        subject: '[data-js-subject]',
        text: '[data-js-text]',
        /*...*/
        editButton: '[data-js-edit]',
        deleteButton: '[data-js-delete]'
    },

    computeds: {
        c_AvatarBgColor: {
            deps: ['author'],
            get: author => prettyColor(author)
        },
        /*...*/
    },

    bindings: {
        '@ui.avatar': 'css:{"background-color":c_AvatarBgColor}',
        /*...*/
    },

    events: {
        /*...*/
    },

    bindingHandlers: {
        /*...*/
    },

    bindingSources() {
        return {
            userModel: this.userModel
        }
    },

    modelEvents: {
        /*...*/
    }
})
class MessageView extends ItemView {
    initialize() {
        this.viewModel = new ViewModel({
            parentViewModel: this.options.parentViewModel || null
        });

        this.userModel = this.options.userModel
    }

    onDestroy() {
        this.viewModel.destroy();
    }
}

export default MessageView;