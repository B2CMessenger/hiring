import _ from 'underscore';
import test from 'blue-tape';
import sinon from 'sinon';
import { waitEvent, nextTick, waitRequest } from '../test-utils';

import settings from '../../../src/settings';
import App from '../../../src/App/App';
import $ from 'jquery';
import MessageModel from '../../../src/Message/MessageModel';
import EditorView from '../../../src/Editor/Editor';

test('[Acceptance] [EditorView] post new message [16pts]',
    async t => {
        const xhr = sinon.useFakeXMLHttpRequest();
        try {
            localStorage.clear();
            const app = new App();
            app.start();

            const userName = 'Vasya';
            const requests = [];
            xhr.onCreate = req => requests.push(req);

            app.userModel.save({ name: userName });
            await waitRequest(requests).then(request => {
                request.respond(200,
                    { "Content-Type": "application/json" },
                    '{ "name": "' + userName + '", "token": "1" }'
                )
            });

            await waitRequest(requests).then(request => request.respond(200,
                { "Content-Type": "application/json" },
                '[]'
            ));
            await nextTick();

            app.getRegion('header').currentView.trigger('add');
            await nextTick();

            const editorView = app.getRegion('footer').currentView;

            t.ok(_.all(editorView.$el.find('button:visible,input:visible'), el => !$(el).is(':disabled')),
                'all active elements are not `disabled` before request');
            t.equal(editorView.$el.find('[data-js-subject]').val(), '',
                '`[data-js-subject]` is empty');
            t.equal(editorView.$el.find('[data-js-text]').val(), '',
                '`[data-js-text]` is empty');
            
            const subject = 'Subject of the new message';
            const text = 'Some text goes here...';

            editorView.$el.find('[data-js-subject]').val(subject).change();
            editorView.$el.find('[data-js-text]').val(text).change();
            editorView.$el.find('button,input[type="button"]').click();

            const newMesaggeRequest = await waitRequest(requests);

            t.ok(_.all(editorView.$el.find('button:visible,input:visible'), el => $(el).is(':disabled')),
                'all active elements are `disabled` during request');
            t.equal(newMesaggeRequest.url, settings.host + '/messages',
                '`request.url` is `/messages`');
            t.equal(newMesaggeRequest.method, 'POST',
                '`request.method` is POST');
            t.deepEqual(_.pick(JSON.parse(newMesaggeRequest.requestBody), ['subject', 'text']), { subject, text },
                '`request.requestBody` is `{ subject, text" }`');

            const date = new Date().toISOString();
            const message = {
                id: 1,
                author: userName,
                subject,
                text,
                charge: 0,
                created_at: date,
                updated_at: date
            };
            newMesaggeRequest.respond(201,
                { "Content-Type": "application/json" },
                JSON.stringify(message)
            );

            await nextTick();
            await nextTick();

            if (app.getRegion('footer').currentView == editorView) {
                const editorView = app.getRegion('footer').currentView;
                t.ok(_.all(editorView.$el.find('button:visible,input:visible'), el => !$(el).is(':disabled')),
                    'all active elements are not `disabled` after request');
            } else {
                t.pass('`EditorView` was removed or replaced');
            }

            const messageView = app.getRegion('content').currentView.children.find(v => v.model.id == message.id);
            t.ok(messageView,
                'newly-created message is present');
            t.equal(messageView.model.id, message.id,
                '`id` is corrent');
            t.equal(messageView.model.get('author'), message.author,
                '`["author"]` is corrent');
            t.equal(messageView.model.get('subject'), message.subject,
                '`["subject"]` is corrent');
            t.equal(messageView.model.get('text'), message.text,
                '`["text"]` is corrent');
            t.equal(messageView.model.get('charge'), message.charge,
                '`["charge"]` is corrent');
            t.equal(messageView.model.get('created_at'), message.created_at,
                '`["created_at"]` is corrent');
            t.equal(messageView.model.get('updated_at'), message.updated_at,
                '`["updated_at"]` is corrent');

            app.destroy();
        } finally {
            xhr.restore();
        }
    }
);

test('[Acceptance] [EditorView] edit existing message [16pts]',
    async t => {
        const xhr = sinon.useFakeXMLHttpRequest();
        try {
            localStorage.clear();
            const app = new App();
            app.start();

            const userName = 'Vasya';
            const requests = [];
            xhr.onCreate = req => requests.push(req);

            app.userModel.save({ name: userName });
            await waitRequest(requests).then(request => {
                request.respond(200,
                    { "Content-Type": "application/json" },
                    '{ "name": "' + userName + '", "token": "1" }'
                )
            });

            await waitRequest(requests).then(request => request.respond(200,
                { "Content-Type": "application/json" },
                '[{"id":1,"author":"' + userName + '","subject":"subject","text":"text","charge":0,"created_at":' +
                '"2018-11-26T04:22:42Z","updated_at":"2018-11-26T04:22:42Z"}]'
            ));
            await nextTick();

            const messageModel = app.getRegion('content').currentView.children.find(v => v.model.id == 1).model;
            app.getRegion('content').currentView.children.find(v => v.model.id == 1).trigger('edit', messageModel);
            await nextTick();

            const editorView = app.getRegion('footer').currentView;

            t.ok(_.all(editorView.$el.find('button:visible,input:visible'), el => !$(el).is(':disabled')),
                'all active elements are not `disabled` before request');
            t.equal(editorView.$el.find('[data-js-subject]').val(), messageModel.get('subject'),
                '`[data-js-subject]` has proper value');
            t.equal(editorView.$el.find('[data-js-text]').val(), messageModel.get('text'),
                '`[data-js-text]` has proper value');
            
            const subject = 'Subject of the new message';
            const text = 'Some text goes here...';

            editorView.$el.find('[data-js-subject]').val(subject).change();
            editorView.$el.find('[data-js-text]').val(text).change();
            editorView.$el.find('button,input[type="button"]').click();

            const editMesaggeRequest = await waitRequest(requests);

            t.ok(_.all(editorView.$el.find('button:visible,input:visible'), el => $(el).is(':disabled')),
                'all active elements are `disabled` during request');
            t.equal(editMesaggeRequest.url, settings.host + '/messages/' + messageModel.id,
                '`request.url` is `/messages`');
            t.equal(editMesaggeRequest.method, 'PUT',
                '`request.method` is PUT');
            t.deepEqual(_.pick(JSON.parse(editMesaggeRequest.requestBody), ['subject', 'text']), { subject, text },
                '`request.requestBody` is `{ subject, text" }`');

            const date = new Date().toISOString();
            const message = {
                id: messageModel.id,
                author: messageModel.get('author'),
                subject,
                text,
                charge: messageModel.get('charge'),
                created_at: messageModel.get('created_at'),
                updated_at: date
            };
            editMesaggeRequest.respond(201,
                { "Content-Type": "application/json" },
                JSON.stringify(message)
            );

            await nextTick();
            await nextTick();

            if (app.getRegion('footer').currentView == editorView) {
                const editorView = app.getRegion('footer').currentView;
                t.ok(_.all(editorView.$el.find('button:visible,input:visible'), el => !$(el).is(':disabled')),
                    'all active elements are not `disabled` after request');
            } else {
                t.pass('`EditorView` was removed or replaced');
            }

            const messageView = app.getRegion('content').currentView.children.find(v => v.model.id == message.id);
            t.ok(messageView,
                'edited message is present');
            t.equal(messageView.model.id, message.id,
                '`id` is corrent');
            t.equal(messageView.model.get('author'), message.author,
                '`["author"]` is corrent');
            t.equal(messageView.model.get('subject'), message.subject,
                '`["subject"]` is corrent');
            t.equal(messageView.model.get('text'), message.text,
                '`["text"]` is corrent');
            t.equal(messageView.model.get('charge'), message.charge,
                '`["charge"]` is corrent');
            t.equal(messageView.model.get('created_at'), message.created_at,
                '`["created_at"]` is corrent');
            t.equal(messageView.model.get('updated_at'), message.updated_at,
                '`["updated_at"]` is corrent');

            app.destroy();
        } finally {
            xhr.restore();
        }
    }
);