import _ from 'underscore';
import test from 'blue-tape';
import sinon from 'sinon';
import { waitEvent, nextTick } from './test-utils';
import { Application, ViewModel } from '@say2b/backbone';
import $ from 'jquery';

import settings from '../../src/settings';
import App from '../../src/App/App';
import UserModel from '../../src/User/UserModel';
import MessageCollection from '../../src/Message/MessageCollection';
import MessageModel from '../../src/Message/MessageModel';
import UserPanelView from '../../src/User/UserPanel';
import MessagesView from '../../src/Message/Messages';
import EditorView from '../../src/Editor/Editor';



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

test("`App.onStart()` auto-logins user if `userName` was stored in `localStorage`", async t => {
    const xhr = sinon.useFakeXMLHttpRequest();
    const requests = [];
    xhr.onCreate = (xhr) => requests.push(xhr);

    try {
        {
            localStorage.clear();
            const app = new App();

            app.start();

            t.equal(requests.length, 0, 'no requests if localStorage has no `userName`');


            app.destroy();
        }

        {
            const userName = 'Vasya';
            localStorage.setItem('userName', userName);
            const app = new App();

            waitEvent(app.userModel, 'request').then(() => {
                t.equal(requests.length, 1, '1 request if localStorage has no `userName`');
                const request = requests[0];
                t.equal(request.url, settings.host + '/authorize', '`request.url` is `/authorize`');
                t.equal(request.method, 'POST', '`request.method` is POST');
                t.deepEqual(JSON.parse(request.requestBody), { name: userName },
                    '`request.requestBody` is `{ name: "' + userName + '" }`');

                request.error(0);
            })

            app.start();

            app.destroy();
        }
    } finally {
        xhr.restore();
    }
});

test("changes of `App.userModel[isLoggedIn]` should update `localStorage[userName] and in case of login " +
    "`App.messageCollection` should be fetched", async t => {
        const xhr = sinon.useFakeXMLHttpRequest();
        try {
            localStorage.clear();
            const app = new App();

            app.start();

            const userName = 'Vasya';
            xhr.onCreate = (request) => _.defer(() => request.respond(200,
                { "Content-Type": "application/json" },
                '{ "name": "' + userName + '", "token": "1" }'
            ));

            app.userModel.save({ name: userName }, { wait: true });

            const requests = [];
            xhr.onCreate = (xhr) => requests.push(xhr);

            await waitEvent(app.userModel, 'change:isLoggedIn');
            await nextTick();

            t.equal(localStorage.getItem('userName'), userName, 'localStorage[userName] is correct');
            t.equal(requests.length, 1, '1 request after user logins');
            const request = requests[0];
            t.equal(request.url, settings.host + '/messages', '`request.url` is `/messages`');
            t.equal(request.method, 'GET', '`request.method` is GET');

            request.error(0);

            app.userModel.clear();
            t.equal(app.userModel.get('isLoggedIn'), false, 'App.userModel[isLoggedIn] is `false`');
            t.notOk(localStorage.getItem('userName'), 'localStorage[userName] is empty');

            app.destroy();
        } finally {
            xhr.restore();
        }
    }
);

test("on `add@UserPanelView` event `App` should show `EditorView` with new MessageModel in `footer` region", async t => {
    const xhr = sinon.useFakeXMLHttpRequest();
    try {
        const userName = 'Vasya';
        localStorage.setItem('userName', userName);
        const app = new App();
        xhr.onCreate = (request) => _.defer(() => {
            if (/\/authorize$/.test(request.url)) {
                request.respond(200,
                    { "Content-Type": "application/json" },
                    '{ "name": "' + userName + '", "token": "1" }'
                );
            } else if (/\/messages$/.test(request.url)) {
                request.respond(200,
                    { "Content-Type": "application/json" },
                    '[{"id":1,"author":"' + userName + '","subject":"subject","text":"text","charge":0,' +
                    '"created_at":"2018-11-26T04:22:42Z","updated_at":"2018-11-26T04:22:42Z"}]'
                );
            } else {
                request.respond(0);
            }
        });
        app.start();

        await nextTick();
        await nextTick();

        app.getRegion('header').currentView.trigger('add');

        const editorView = app.getRegion('footer').currentView;
        t.ok(editorView instanceof EditorView, '`footer` region has `EditorView`');
        const editorModel = editorView.model;
        t.ok(editorModel instanceof MessageModel, '`editorView.model` is instance of `MessageModel`');
        t.ok(editorModel.isNew(), '`editorView.model` is new');

        app.getRegion('footer').currentView.trigger('add');
        t.equal(editorView, app.getRegion('footer').currentView,
            'repeated trigger of `add` event doesn\'t change `editorView`');
        t.equal(editorView.model, editorModel,
            'repeated trigger of `add` event doesn\'t change `editorView.model`');

        app.destroy();
    } finally {
        xhr.restore();
    }
}
);