import _ from 'underscore';
import test from 'blue-tape';
import sinon from 'sinon';
import { waitEvent, nextTick, waitRequest } from '../test-utils';

import settings from '../../../src/settings';
import App from '../../../src/App/App';
import MessageModel from '../../../src/Message/MessageModel';
import EditorView from '../../../src/Editor/Editor';

test('[Acceptance] [MessagesView] is sorted by `["created_at"]` [3pts]',
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
                '"2018-11-26T04:22:42Z","updated_at":"2018-11-26T04:22:42Z"},{"id":2,"author":"' + userName + '",' +
                '"subject":"subject","text":"text","charge":0,"created_at":"2018-12-15T04:22:42Z","updated_at":' +
                '"2018-12-15T04:22:42Z"},{"id":3,"author":"' + userName + '","subject":"subject","text":"text",' +
                '"charge":0,"created_at":"2018-12-14T04:22:42Z","updated_at":"2018-12-14T04:22:42Z"}]'
            ));

            await nextTick();

            const messagesView = app.getRegion('content').currentView;
            t.equal(messagesView.children.findByIndex(0).model.id, 1,
                'first message has id `1`');
            t.equal(messagesView.children.findByIndex(1).model.id, 3,
                'second message has id `3`');
            t.equal(messagesView.children.findByIndex(2).model.id, 2,
                'third message has id `2`');

            app.destroy();
        } finally {
            xhr.restore();
        }
    }
);