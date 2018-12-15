import _ from 'underscore';
import test from 'blue-tape';
import sinon from 'sinon';
import { waitEvent, nextTick, waitRequest } from '../test-utils';

import settings from '../../../src/settings';
import App from '../../../src/App/App';
import MessageModel from '../../../src/Message/MessageModel';
import EditorView from '../../../src/Editor/Editor';

test(
    "[Acceptance] [App] `App.onStart()` does not auto-login user if `userName` is not stored in `localStorage` [2pts]",
    async t => {
        const xhr = sinon.useFakeXMLHttpRequest();
        const requests = [];
        xhr.onCreate = (xhr) => requests.push(xhr);

        try {
            localStorage.clear();
            const app = new App();

            app.start();

            t.equal(requests.length, 0,
                'no requests if localStorage has no `userName`');
            t.equal(app.userModel.get('isLoggedIn'), false,
                "`App.userModel[isLoggedIn]` is `false`");

            app.destroy();
        } finally {
            xhr.restore();
        }
    }
);

test(
    "[Acceptance] [App] `App.onStart()` auto-logins user if `userName` was stored in `localStorage` [5pts]",
    async t => {
        const xhr = sinon.useFakeXMLHttpRequest();
        const requests = [];
        xhr.onCreate = req => requests.push(req);

        try {
            const userName = 'Vasya';
            localStorage.setItem('userName', userName);
            const app = new App();

            app.start();

            const request = await waitRequest(requests);

            t.equal(requests.length + 1, 1,
                '1 request was made');
            t.equal(request.url, settings.host + '/authorize',
                '`request.url` is `/authorize`');
            t.equal(request.method, 'POST',
                '`request.method` is POST');
            t.deepEqual(JSON.parse(request.requestBody), { name: userName },
                '`request.requestBody` is `{ name: "' + userName + '" }`');

            _.defer(() => request.respond(200,
                { "Content-Type": "application/json" },
                '{ "name": "' + userName + '", "token": "1" }'
            ));

            await waitEvent(app.userModel, 'change:isLoggedIn');

            t.equal(app.userModel.get('isLoggedIn'), true,
                "`App.userModel[isLoggedIn]` is `true`");

            app.destroy();
        } finally {
            xhr.restore();
        }
    }
);

test(
    '[Acceptance] [App] changes of `App.userModel["isLoggedIn"]` should update `localStorage["userName"]` [6pts]',
    async t => {
        const xhr = sinon.useFakeXMLHttpRequest();
        try {
            localStorage.clear();
            const app = new App();

            app.start();

            t.equal(app.userModel.get('isLoggedIn'), false,
                'App.userModel["isLoggedIn"] is `false`');
            t.notOk(localStorage.getItem('userName'),
                'localStorage["userName"] is empty');

            const userName = 'Vasya';
            xhr.onCreate = (request) => _.defer(() => request.respond(200,
                { "Content-Type": "application/json" },
                '{ "name": "' + userName + '", "token": "1" }'
            ));

            _.defer(() => app.userModel.save({ name: userName }));
            await waitEvent(app.userModel, 'change:isLoggedIn');

            t.equal(app.userModel.get('isLoggedIn'), true,
                'App.userModel["isLoggedIn"] is `true`');
            t.equal(localStorage.getItem('userName'), userName,
                'localStorage["userName"] is correct');

            app.userModel.clear();

            t.equal(app.userModel.get('isLoggedIn'), false,
                'App.userModel["isLoggedIn"] is `false`');
            t.notOk(localStorage.getItem('userName'),
                'localStorage["userName"] is empty');

            app.destroy();
        } finally {
            xhr.restore();
        }
    }
);

test(
    '[Acceptance] [App] if `App.userModel["isLoggedIn"]` changes to `true` then `App.messageCollection` should be' +
    ' fetched [4pts]',
    async t => {
        const xhr = sinon.useFakeXMLHttpRequest();
        try {
            localStorage.clear();
            const app = new App();

            app.start();

            const userName = 'Vasya';
            const requests = [];
            xhr.onCreate = (request) => {
                requests.push(request);
                _.defer(() => {
                    if (/\/authorize$/.test(request.url)) {
                        request.respond(200,
                            { "Content-Type": "application/json" },
                            '{ "name": "' + userName + '", "token": "1" }'
                        );
                    } else {
                        request.error(0);
                    }
                })
            };

            _.defer(() => app.userModel.save({ name: userName }));
            await waitEvent(app.userModel, 'change:isLoggedIn');

            t.equal(app.userModel.get('isLoggedIn'), true,
                'App.userModel["isLoggedIn"] is `true`');

            if (requests.length < 2) {
                await waitEvent(app.messageCollection, 'request');
            }

            t.equal(requests.length, 2,
                'besides login request, 1 request was made');
            const request = requests[1];
            t.equal(request.url, settings.host + '/messages',
                '`request.url` is `/messages`');
            t.equal(request.method, 'GET',
                '`request.method` is GET');

            app.destroy();
        } finally {
            xhr.restore();
        }
    }
);

test(
    '[Acceptance] [App] if `App.userModel["isLoggedIn"]` changes to `false` then `App` should remove `EditorView`' +
    ' from `footer` region [3pts]',
    async t => {
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

            _.defer(() => app.userModel.save({ name: userName }));
            await waitEvent(app.userModel, 'change:isLoggedIn');

            app.getRegion('header').currentView.trigger('add');
            t.ok(app.getRegion('footer').currentView instanceof EditorView,
                '`footer` region has `EditorView`');

            app.userModel.clear();

            t.equal(app.userModel.get('isLoggedIn'), false,
                'App.userModel["isLoggedIn"] is `false`');

            t.notOk(app.getRegion('footer').currentView,
                '`footer` region has `EditorView`');

            app.destroy();
        } finally {
            xhr.restore();
        }
    }
);

test('[Acceptance] [App] on `add@UserPanelView` event `App` should show `EditorView` with new `MessageModel` in' +
    ' `footer` region [5pts]',
    async t => {
        const xhr = sinon.useFakeXMLHttpRequest();
        try {
            localStorage.clear();
            const app = new App();
            app.start();

            const userName = 'Vasya';
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


            _.defer(() => app.userModel.save({ name: userName }));
            await waitEvent(app.messageCollection, 'sync');

            app.getRegion('header').currentView.trigger('add');

            const editorView = app.getRegion('footer').currentView;
            t.ok(editorView instanceof EditorView,
                '`footer` region has `EditorView`');
            const editorModel = editorView.model;
            t.ok(editorModel instanceof MessageModel,
                '`editorView.model` is instance of `MessageModel`');
            t.ok(editorModel.isNew(),
                '`editorView.model` is new');
            
            app.getRegion('header').currentView.trigger('add');
            await nextTick();

            t.equal(app.getRegion('footer').currentView, editorView,
                'subsequent `add@UserPanelView` events should not change existing `UserPanelView`');
            t.equal(editorView.model, editorModel,
                'subsequent `add@UserPanelView` events should not change existing `UserPanelView.model`');

            app.destroy();
        } finally {
            xhr.restore();
        }
    }
);

test('[Acceptance] [App] on `edit@MessagesView` event `App` should show `EditorView` with `MessageModel` of this' +
    ' particular message in `footer` region [5pts]',
    async t => {
        const xhr = sinon.useFakeXMLHttpRequest();
        try {
            localStorage.clear();
            const app = new App();
            app.start();

            const userName = 'Vasya';
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
                        '"created_at":"2018-11-26T04:22:42Z","updated_at":"2018-11-26T04:22:42Z"},{"id":2,' +
                        '"author":"Petya","subject":"subject2","text":"text2","charge":0,' +
                        '"created_at":"2018-12-14T04:22:42Z","updated_at":"2018-12-14T04:22:42Z"}]'
                    );
                } else {
                    request.respond(0);
                }
            });


            _.defer(() => app.userModel.save({ name: userName }));
            await waitEvent(app.messageCollection, 'sync');

            const messageView = app.getRegion('content').currentView.children.find(v => v.model.id == 1);
            messageView.trigger('edit', messageView.model);

            const editorView = app.getRegion('footer').currentView;
            t.ok(editorView instanceof EditorView,
                '`footer` region has `EditorView`');
            const editorModel = editorView.model;
            t.ok(editorModel instanceof MessageModel,
                '`editorView.model` is instance of `MessageModel`');
            t.deepEqual(editorModel.toJSON(), messageView.model.toJSON(),
                '`editorView.model` is `messageModel` of existing message');
            
            messageView.trigger('edit', messageView.model);
            await nextTick();

            t.equal(app.getRegion('footer').currentView, editorView,
                'subsequent `edit@MessagesView` events from the same `MessagesView` should not change existing `UserPanelView`');
            t.equal(editorView.model, editorModel,
                'subsequent `edit@MessagesView` evnts from the same `MessagesView` should not change existing `UserPanelView.model`');

            app.destroy();
        } finally {
            xhr.restore();
        }
    }
);

test('[Acceptance] [App] on if user edits existing message then deletes it `EditorView` should be destroyed [2pts]',
    async t => {
        const xhr = sinon.useFakeXMLHttpRequest();
        try {
            localStorage.clear();
            const app = new App();
            app.start();

            const userName = 'Vasya';
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
                        '"created_at":"2018-11-26T04:22:42Z","updated_at":"2018-11-26T04:22:42Z"},{"id":2,' +
                        '"author":"Petya","subject":"subject2","text":"text2","charge":0,' +
                        '"created_at":"2018-12-14T04:22:42Z","updated_at":"2018-12-14T04:22:42Z"}]'
                    );
                } else {
                    request.respond(204);
                }
            });


            _.defer(() => app.userModel.save({ name: userName }));
            await waitEvent(app.messageCollection, 'sync');

            const messageView = app.getRegion('content').currentView.children.find(v => v.model.id == 1);
            messageView.$el.find('[data-js-edit]').click();

            t.ok(app.getRegion('footer').currentView,
                'if users clicks on edit message button then editor should be shown');

            await nextTick();

            _.defer(() => messageView.$el.find('[data-js-delete]').click());
            await waitEvent(messageView.model, 'destroy');

            t.notOk(app.getRegion('footer').currentView,
                'if message was deleted editor with that message should be destroyed');

            app.destroy();
        } finally {
            xhr.restore();
        }
    }
);