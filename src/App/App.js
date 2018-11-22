import _ from 'underscore';
import $ from 'jquery';
import { Application, ViewModel, properties } from '@say2b/backbone';

import UserModel from '../User/UserModel';
import MessageCollection from '../Message/MessageCollection';
import MessageModel from '../Message/MessageModel';
import UserPanelView from '../User/UserPanel';
import MessagesView from '../Message/Messages';
import EditorView from '../Editor/Editor';

import './App.scss';

@properties({
    regions: {
        header: '#header',
        content: '#content',
        footer: '#footer'
    }
})
class App extends Application {
    initialize() {
        this._ensureRegions();

        this.viewModel = new ViewModel;
        this.userModel = new UserModel();
        this.messageCollection = new MessageCollection;
    }

    onStart() {
        this.listenTo(this.userModel, 'change:isLoggedIn', this._onUserModelIsLoggedInChange);

        /*...*/
    }

    onDestroy() {
        this.emptyRegions();
        this._destroyRegions();

        this.viewModel.destroy();
    }

    _ensureRegions() {
        _.each(this.regions, selector => {
            if (!$(selector).length) {
                const matches = selector.match(/^\#(\w+)/i);
                if (!matches || !matches[1]) {
                    throw new Error('can\'t determine id from selector');
                }

                $('body').append(`<div id="${matches[1]}"></div>`);
            }
        })
    }

    _destroyRegions() {
        _.each(this.regions, selector => {
            $(selector).remove();
        })
    }

    _onUserModelIsLoggedInChange(m, isLoggedIn) {
        if (isLoggedIn) {
            /*...*/
        } else {
            /*...*/
        }
    }

    _onUserPanelViewAdd() {
        /*...*/
    }

    _onMessagesViewEdit(messageView, messageModel) {
        /*...*/
    }
};

export default App;