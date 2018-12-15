import _ from 'underscore';
import test from 'blue-tape';
import sinon from 'sinon';
import { nextTick, waitRequest } from '../test-utils';

import settings from '../../../src/settings';
import App from '../../../src/App/App';
import $ from 'jquery';

test('[Acceptance] [MessageView] header should contain `[data-js-author]` and `[data-js-date]` [2pts]',
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

            const messageView = app.getRegion('content').currentView.children.findByIndex(0);
            const messageModel = messageView.model;
            t.equal(messageView.$el.find('[data-js-author]').text(), userName,
                '`[data-js-author]` is present and has proper text');
            t.equal(messageView.$el.find('[data-js-date]').text(), new Date(messageModel.get('updated_at')).toLocaleString(),
                '`[data-js-date]` is present and has proper text');

            app.destroy();
        } finally {
            xhr.restore();
        }
    }
);

test('[Acceptance] [MessageView] if `MessageModel["updated_at"]` changes `[data-js-date]` should be updated via' +
    ' partial rendering [4pts]',
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

            const messageView = app.getRegion('content').currentView.children.findByIndex(0);
            const messageModel = messageView.model;
            const messageEl = messageView.$el.find('[data-js-date]')[0];
            t.equal(messageView.$el.find('[data-js-date]').text(), new Date(messageModel.get('updated_at')).toLocaleString(),
                'iniital `[data-js-date]` has proper text');

            messageModel.set({ updated_at: new Date().toISOString() });

            t.equal(messageView.$el.find('[data-js-date]').text(), new Date(messageModel.get('updated_at')).toLocaleString(),
                'updated `[data-js-date]` has proper text');
            t.equal(messageView.$el.find('[data-js-date]')[0], messageEl,
                'updated `[data-js-date]` is the same element');
            t.equal(messageView.$el.find('[data-js-date]').parent()[0], messageEl.parentElement,
                'updated `[data-js-date]` has the same parent element');

            app.destroy();
        } finally {
            xhr.restore();
        }
    }
);

test('[Acceptance] [MessageView] if `MessageModel["subject"]` changes `[data-js-subject]` should be updated via' +
    ' partial rendering [4pts]',
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

            const messageView = app.getRegion('content').currentView.children.findByIndex(0);
            const messageModel = messageView.model;
            const messageEl = messageView.$el.find('[data-js-subject]')[0];
            t.equal(messageView.$el.find('[data-js-subject]').text(), messageModel.get('subject'),
                'iniital `[data-js-subject]` has proper text');

            messageModel.set({ subject: "new subject" });

            t.equal(messageView.$el.find('[data-js-subject]').text(), messageModel.get('subject'),
                'updated `[data-js-subject]` has proper text');
            t.equal(messageView.$el.find('[data-js-subject]')[0], messageEl,
                'updated `[data-js-subject]` is the same element');
            t.equal(messageView.$el.find('[data-js-subject]').parent()[0], messageEl.parentElement,
                'updated `[data-js-subject]` has the same parent element');

            app.destroy();
        } finally {
            xhr.restore();
        }
    }
);

test('[Acceptance] [MessageView] if `MessageModel["text"]` changes `[data-js-text]` should be updated via' +
    ' partial rendering [4pts]',
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

            const messageView = app.getRegion('content').currentView.children.findByIndex(0);
            const messageModel = messageView.model;
            const messageEl = messageView.$el.find('[data-js-text]')[0];
            t.equal(messageView.$el.find('[data-js-text]').text(), messageModel.get('text'),
                'iniital `[data-js-text]` has proper text');

            messageModel.set({ text: "new text" });

            t.equal(messageView.$el.find('[data-js-text]').text(), messageModel.get('text'),
                'updated `[data-js-text]` has proper text');
            t.equal(messageView.$el.find('[data-js-text]')[0], messageEl,
                'updated `[data-js-text]` is the same element');
            t.equal(messageView.$el.find('[data-js-text]').parent()[0], messageEl.parentElement,
                'updated `[data-js-text]` has the same parent element');

            app.destroy();
        } finally {
            xhr.restore();
        }
    }
);

test('[Acceptance] [MessageView] if `MessageModel["charge"]` changes `[data-js-charge]` should be updated via' +
    ' partial rendering [1pts]',
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

            const messageView = app.getRegion('content').currentView.children.findByIndex(0);
            const messageModel = messageView.model;
            const el = messageView.$el.find('[data-js-charge]').parent()[0];
            messageModel.set({ charge: 10 });

            await nextTick();

            const newMessageView = app.getRegion('content').currentView.children.findByIndex(0);
            t.equal(newMessageView.$el.find('[data-js-charge]').parent()[0] || null, el,
                'updated `[data-js-charge]` have the same parent element');

            app.destroy();
        } finally {
            xhr.restore();
        }
    }
);

test('[Acceptance] [MessageView] click on `[data-js-charge=5]` for `MessageView` with ``MessageModel["charge"] == 0`' +
    ' should invoke series of requests resulting in `MessageModel["charge"] == 5` [14pts]',
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

            const messageView = app.getRegion('content').currentView.children.findByIndex(0);
            const messageModel = messageView.model;
            t.equal(messageModel.get('charge'), 0,
                'initial `MessageModel["charge"]` is `0`');

            t.ok(_.all(messageView.$el.find('button:visible,input:visible'), el => !$(el).is(':disabled')),
                'all active elements are not `disabled` before requests');

            messageView.$el.find('[data-js-charge="5"]').click();

            for (let i = 0; i < 5; ++i) {
                const request = await waitRequest(requests);

                t.ok(_.all(messageView.$el.find('button:visible,input:visible'), el => $(el).is(':disabled')),
                    'all active elements are `disabled` during requests');

                t.equal(request.method + ' ' + request.url + ': ' + JSON.stringify(JSON.parse(request.requestBody)),
                    'POST ' + settings.host + '/message/charge_increase' + ': ' + JSON.stringify({ id: 1 }),
                    'request is correct');

                request.respond(200,
                    { "Content-Type": "application/json" },
                    `{"charge":${i + 1}}`
                );

                await nextTick();
            }

            t.equal(messageModel.get('charge'), 5,
                '`MessageModel["charge"]` is `5`');

            t.ok(_.all(messageView.$el.find('button:visible,input:visible'), el => !$(el).is(':disabled')),
                'all active elements are not `disabled` after requests');

            app.destroy();
        } finally {
            xhr.restore();
        }
    }
);

test('[Acceptance] [MessageView] click on `[data-js-charge=1]` for `MessageView` with ``MessageModel["charge"] == 6`' +
    ' should invoke series of requests resulting in `MessageModel["charge"] == 1` [14pts]',
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
                '[{"id":1,"author":"' + userName + '","subject":"subject","text":"text","charge":6,"created_at":' +
                '"2018-11-26T04:22:42Z","updated_at":"2018-11-26T04:22:42Z"}]'
            ));

            await nextTick();

            const messageView = app.getRegion('content').currentView.children.findByIndex(0);
            const messageModel = messageView.model;
            t.equal(messageModel.get('charge'), 6,
                'initial `MessageModel["charge"]` is `6`');

            t.ok(_.all(messageView.$el.find('button:visible,input:visible'), el => !$(el).is(':disabled')),
                'all active elements are not `disabled` before requests');

            messageView.$el.find('[data-js-charge="1"]').click();

            for (let i = 6; i > 1; --i) {
                const request = await waitRequest(requests);

                t.ok(_.all(messageView.$el.find('button:visible,input:visible'), el => $(el).is(':disabled')),
                    'all active elements are `disabled` during requests');

                t.equal(request.method + ' ' + request.url + ': ' + JSON.stringify(JSON.parse(request.requestBody)),
                    'POST ' + settings.host + '/message/charge_decrease' + ': ' + JSON.stringify({ id: 1 }),
                    'request is correct');

                request.respond(200,
                    { "Content-Type": "application/json" },
                    `{"charge":${i - 1}}`
                );

                await nextTick();
            }

            t.equal(messageModel.get('charge'), 1,
                '`MessageModel["charge"]` is `1`');

            t.ok(_.all(messageView.$el.find('button:visible,input:visible'), el => !$(el).is(':disabled')),
                'all active elements are not `disabled` after requests');

            app.destroy();
        } finally {
            xhr.restore();
        }
    }
);

test('[Acceptance] [MessageView] `[data-js-edit]` and `[data-js-delete]` buttons should be available only for author' +
    ' [4pts]',
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

            const anotherName = 'Petya';
            await waitRequest(requests).then(request => request.respond(200,
                { "Content-Type": "application/json" },
                '[{"id":1,"author":"' + userName + '","subject":"subject","text":"text","charge":6,"created_at":' +
                '"2018-11-26T04:22:42Z","updated_at":"2018-11-26T04:22:42Z"},{"id":2,"author":"' + anotherName + '",' +
                '"subject":"subject2","text":"text2","charge":6,"created_at":"2018-11-27T04:22:42Z","updated_at":' +
                '"2018-11-27T04:22:42Z"}]'
            ));

            await nextTick();

            const vasyaMessageView = app.getRegion('content').currentView.children.findByIndex(0);

            t.ok(vasyaMessageView.$el.find('[data-js-edit]:not(:disabled):visible').length,
                '`[data-js-edit]` is present for author');
            t.ok(vasyaMessageView.$el.find('[data-js-delete]:not(:disabled):visible').length,
                '`[data-js-delete]` is present for author');

            const petyaMessageView = app.getRegion('content').currentView.children.findByIndex(1);

            t.notOk(petyaMessageView.$el.find('[data-js-edit]:not(:disabled):visible').length,
                '`[data-js-edit]` is not present for non-author');
            t.notOk(petyaMessageView.$el.find('[data-js-delete]:not(:disabled):visible').length,
                '`[data-js-delete]` is not present for non-author');
            

            app.destroy();
        } finally {
            xhr.restore();
        }
    }
);

test('[Acceptance] [MessageView] click on `[data-js-edit]` should trigger `edit@MessageView` event [2pts]',
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
                '[{"id":1,"author":"' + userName + '","subject":"subject","text":"text","charge":6,"created_at":' +
                '"2018-11-26T04:22:42Z","updated_at":"2018-11-26T04:22:42Z"}]'
            ));

            await nextTick();

            const messageView = app.getRegion('content').currentView.children.findByIndex(0);
            const editEventCb = sinon.spy();
            messageView.on('edit', editEventCb);

            messageView.$el.find('[data-js-edit]').click();

            await nextTick();

            t.equal(editEventCb.callCount, 1,
                '`edit` event was triggered once');
            t.ok(editEventCb.args[0].length >= 1 && editEventCb.args[0][0] == messageView.model,
                '`edit` event has proper arguments');

            app.destroy();
        } finally {
            xhr.restore();
        }
    }
);

test('[Acceptance] [MessageView] click on `[data-js-delete]` should decrease charge from `2` to `0` and delete' +
    ' message [8pts]',
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
                '[{"id":1,"author":"' + userName + '","subject":"subject","text":"text","charge":2,"created_at":' +
                '"2018-11-26T04:22:42Z","updated_at":"2018-11-26T04:22:42Z"}]'
            ));

            await nextTick();

            const messageView = app.getRegion('content').currentView.children.findByIndex(0);
            messageView.$el.find('[data-js-delete]').click();

            const request1 = await waitRequest(requests);
            t.ok(_.all(messageView.$el.find('button:visible,input:visible'), el => $(el).is(':disabled')),
                'all active elements are `disabled` during requests');
            t.equal(request1.method + ' ' + request1.url + ': ' + JSON.stringify(JSON.parse(request1.requestBody)),
                'POST ' + settings.host + '/message/charge_decrease' + ': ' + JSON.stringify({ id: 1 }),
                'request to decrease charge is correct');

            request1.respond(200,
                { "Content-Type": "application/json" },
                `{"charge":1}`
            );
            await nextTick();

            const request2 = await waitRequest(requests);
            t.ok(_.all(messageView.$el.find('button:visible,input:visible'), el => $(el).is(':disabled')),
                'all active elements are `disabled` during requests');
            t.equal(request2.method + ' ' + request2.url + ': ' + JSON.stringify(JSON.parse(request2.requestBody)),
                'POST ' + settings.host + '/message/charge_decrease' + ': ' + JSON.stringify({ id: 1 }),
                'request to decrease charge  is correct');

            request2.respond(200,
                { "Content-Type": "application/json" },
                `{"charge":0}`
            );
            await nextTick();

            const request3 = await waitRequest(requests);
            t.ok(_.all(messageView.$el.find('button:visible,input:visible'), el => $(el).is(':disabled')),
                'all active elements are `disabled` during requests');
            t.equal(request3.method + ' ' + request3.url + ': ' + JSON.stringify(JSON.parse(request3.requestBody)),
                'POST ' + settings.host + '/message/delete' + ': ' + JSON.stringify({ id: 1 }),
                'request to delete message is correct');

            request3.respond(204);
            await nextTick();

            t.ok(_.all(messageView.$el.find('button:visible,input:visible'), el => !$(el).is(':disabled')),
                'all active elements are not `disabled` after requests');

            t.notOk(app.getRegion('content').currentView.children.findByModel(messageView.model),
                'message is deleted');

            app.destroy();
        } finally {
            xhr.restore();
        }
    }
);

test('[Acceptance] [MessageView] `[data-js-edit]` and `[data-js-delete]` buttons should updated via partial rendering' +
    ' if `app.userModel` changes [6pts]',
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

            const anotherName = 'Petya';
            await waitRequest(requests).then(request => request.respond(200,
                { "Content-Type": "application/json" },
                '[{"id":1,"author":"' + userName + '","subject":"subject","text":"text","charge":6,"created_at":' +
                '"2018-11-26T04:22:42Z","updated_at":"2018-11-26T04:22:42Z"},{"id":2,"author":"' + anotherName + '",' +
                '"subject":"subject2","text":"text2","charge":6,"created_at":"2018-11-27T04:22:42Z","updated_at":' +
                '"2018-11-27T04:22:42Z"}]'
            ));

            await nextTick();

            const messageView = app.getRegion('content').currentView.children.findByIndex(0);
            const editParents = messageView.$el.find('[data-js-edit]:not(:disabled):visible').parentsUntil(messageView.el);
            const deleteParent = messageView.$el.find('[data-js-delete]:not(:disabled):visible').parentsUntil(messageView.el);

            t.ok(messageView.$el.find('[data-js-edit]:not(:disabled):visible').length,
                '`[data-js-edit]` is present for author');
            t.ok(messageView.$el.find('[data-js-delete]:not(:disabled):visible').length,
                '`[data-js-delete]` is present for author');
            
            app.userModel.clear();

            await nextTick();
            const updatedMessageView = app.getRegion('content').currentView.children.findByIndex(0);
            t.notOk(updatedMessageView.$el.find('[data-js-edit]:not(:disabled):visible').length,
                '`[data-js-edit]` is not present for non-author');
            t.notOk(updatedMessageView.$el.find('[data-js-delete]:not(:disabled):visible').length,
                '`[data-js-delete]` is not present for non-author');
            
            let allParentsAreTheSame = true;
            let $el = updatedMessageView.$el;
            for (let i = editParents.length - 1; i >= 0; --i) {
                $el = $el.children().filter(editParents[i]);
                if (!$el.length) {
                    allParentsAreTheSame = false;
                    break;
                }
            }
            
            t.ok(allParentsAreTheSame,
                '`[data-js-edit]` was updated via partial rendering');
            
            allParentsAreTheSame = true;
            $el = updatedMessageView.$el;
            for (let i = deleteParent.length - 1; i >= 0; --i) {
                $el = $el.children().filter(deleteParent[i]);
                if (!$el.length) {
                    allParentsAreTheSame = false;
                    break;
                }
            }

            t.ok(allParentsAreTheSame,
                '`[data-js-delete]` was updated via partial rendering');

            app.destroy();
        } finally {
            xhr.restore();
        }
    }
);