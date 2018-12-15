import _ from 'underscore';
import test from 'blue-tape';
import { Application, ViewModel } from '@say2b/backbone';
import $ from 'jquery';

import App from '../../src/App/App';
import UserModel from '../../src/User/UserModel';
import MessageCollection from '../../src/Message/MessageCollection';
import UserPanelView from '../../src/User/UserPanel';
import MessagesView from '../../src/Message/Messages';

test("`App` is `Application`", t => {
    t.ok(Application.prototype.isPrototypeOf(App.prototype),
        'Application.prototype is prototype of App.prototype');

    const app = new App();
    t.ok(app instanceof Application,
        'app is instance of Application');

    app.destroy();

    t.end();
});

test("`App` ensures region elements", t => {
    t.equal($('#content').length, 0,
        'no #content elements at start');

    const app = new App();

    t.equal($('#content').length, 1,
        'exactly 1 #content element after constructing app');

    app.destroy();

    t.end();
});

test("`App` has `.viewModel`, `.userModel`, `.messageCollection`", t => {
    const app = new App();

    t.ok(app.viewModel instanceof ViewModel, 'app has `.viewModel` and its instance of `ViewModel`');
    t.ok(app.userModel instanceof UserModel, 'app has `.userModel` and its instance of `UserModel`');
    t.ok(app.messageCollection instanceof MessageCollection,
        'app has `.messageCollection` and its instance of `MessageCollection`');

    app.destroy();

    t.end();
});

test("`App.onStart()` shows `UserPanelView`, `MessagesView` in apropriate regions", t => {
    const app = new App();

    app.start();

    t.ok(app.getRegion('header').currentView instanceof UserPanelView,
        'app.onStart()` shows `UserPanelView` in `#header`');
    t.ok(app.getRegion('content').currentView instanceof MessagesView,
        'app.onStart()` shows `MessagesView` in `#content`');

    app.destroy();

    t.end();
});

test("`App.onStart()` shows `UserPanelView`, `MessagesView` in apropriate regions", t => {
    const app = new App();

    app.start();

    t.ok(app.getRegion('header').currentView instanceof UserPanelView,
        'app.onStart()` shows `UserPanelView` in `#header`');
    t.ok(app.getRegion('content').currentView instanceof MessagesView,
        'app.onStart()` shows `MessagesView` in `#content`');

    app.destroy();

    t.end();
});