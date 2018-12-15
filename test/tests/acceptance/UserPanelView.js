import _ from 'underscore';
import test from 'blue-tape';
import sinon from 'sinon';
import { waitEvent, nextTick } from '../test-utils';
import $ from 'jquery';

import settings from '../../../src/settings';
import App from '../../../src/App/App';

test('[Acceptance] [UserPanelView] `UserPanelView` in non-authorized mode has `[data-js-input]` with "Enter your' +
    ' name" placeholder [1pts]',
    async t => {
        localStorage.clear();
        const app = new App();

        app.start();

        const userPanelView = app.getRegion('header').currentView;
        const nameInput = userPanelView.$el.find('[data-js-name-input]')[0];

        t.equal(nameInput.placeholder, "Enter your name",
            '`[data-js-input]` has proper placeholder');

        app.destroy();
    }
);

test('[Acceptance] [UserPanelView] in non-authorized mode click on `[data-js-submit]` button should perform auth' +
    ' request with provided user name [5pts]',
    async t => {
        const xhr = sinon.useFakeXMLHttpRequest();
        try {
            localStorage.clear();
            const app = new App();

            app.start();

            const requests = [];
            xhr.onCreate = (request) => {
                requests.push(request);
                _.defer(() => request.error(0));
            };

            const userName = 'Vasya';
            const userPanelView = app.getRegion('header').currentView;
            const nameInput$ = userPanelView.$el.find('[data-js-name-input]');
            const loginButton$ = userPanelView.$el.find('[data-js-submit]');

            nameInput$.val(userName).change();
            _.defer(() => loginButton$.click());

            await waitEvent(app.userModel, 'request');

            t.equal(requests.length, 1,
                '1 request was made');
            const request = requests[0];
            t.equal(request.url, settings.host + '/authorize',
                '`request.url` is `/authorize`');
            t.equal(request.method, 'POST',
                '`request.method` is POST');
            t.deepEqual(JSON.parse(request.requestBody), { name: userName },
                '`request.requestBody` is `{ name: "' + userName + '" }`');

            t.ok(_.all(userPanelView.$el.find('button,textarea,input'), el => $(el).is(':disabled')),
                'all active elements are `disabled` during request');

            app.destroy();
        } finally {
            xhr.restore();
        }
    }
);

test('[Acceptance] [UserPanelView] in non-authorized mode form submission should perform auth request with provided' +
    ' user name [5pts]',
    async t => {
        const xhr = sinon.useFakeXMLHttpRequest();
        try {
            localStorage.clear();
            const app = new App();

            app.start();

            const requests = [];
            xhr.onCreate = (request) => {
                requests.push(request);
                _.defer(() => request.error(0));
            };

            const userName = 'Vasya';
            const userPanelView = app.getRegion('header').currentView;
            const nameInput$ = userPanelView.$el.find('[data-js-name-input]');

            nameInput$.val(userName).change();
            _.defer(() => nameInput$.closest('form').submit());

            await waitEvent(app.userModel, 'request');

            t.equal(requests.length, 1,
                '1 request was made');
            const request = requests[0];
            t.equal(request.url, settings.host +
                '/authorize', '`request.url` is `/authorize`');
            t.equal(request.method, 'POST',
                '`request.method` is POST');
            t.deepEqual(JSON.parse(request.requestBody), { name: userName },
                '`request.requestBody` is `{ name: "' + userName + '" }`');

            t.ok(
                _.all(
                    userPanelView.$el.find('button,textarea,input'),
                    el => $(el).is(':disabled') || !$(el).is(':visible')
                ),
                'all active elements are `disabled` during request');

            app.destroy();
        } finally {
            xhr.restore();
        }
    }
);

test('[Acceptance] [UserPanelView] after successful auth request widget is in authorized mode [6pts]',
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

            const userPanelView = app.getRegion('header').currentView;
            const nameInput$ = userPanelView.$el.find('[data-js-name-input]');
            const loginButton$ = userPanelView.$el.find('[data-js-submit]');

            nameInput$.val(userName).change();
            _.defer(() => loginButton$.click());

            await waitEvent(app.userModel, 'sync');

            t.ok(app.userModel.get('isLoggedIn'),
                '`app.userModel["isLoggedIn"]` is true');

            t.ok(
                _.all(
                    userPanelView.$el.find('button,textarea,input'),
                    el => !$(el).is(':disabled') || !$(el).is(':visible')
                ),
                'all active elements are not `disabled` after sucessful request');
            t.equal(userPanelView.$el.find('[data-js-add]:visible').length, 1,
                '`[data-js-add]` button is present');
            t.equal(userPanelView.$el.find('[data-js-name-input]:visible').length, 0,
                '`[data-js-name-input]` input is not present or invisible');
            t.equal(userPanelView.$el.find('[data-js-user-name]:visible').text(), userName,
                '`[data-js-user-name]` is present and has proper text');
            t.ok(userPanelView.$el.find('[data-js-submit]:visible').length,
                '`[data-js-submit]` button is present');

            app.destroy();
        } finally {
            xhr.restore();
        }
    }
);

test('[Acceptance] [UserPanelView] in authorized mode click on `[data-js-add]` button should trigger `add` event [1pts]',
    async t => {
        const xhr = sinon.useFakeXMLHttpRequest();
        try {
            localStorage.clear();
            const app = new App();

            app.start();

            const userName = 'Vasya';
            const requests = [];
            xhr.onCreate = (request) => { requests.push(request) };

            app.userModel.save({ name: userName });
            _.defer(() => requests[0].respond(200,
                { "Content-Type": "application/json" },
                '{ "name": "' + userName + '", "token": "1" }'
            ));

            await waitEvent(app.userModel, 'sync');

            const userPanelView = app.getRegion('header').currentView;

            const addEventCb = sinon.spy();
            userPanelView.on('add', addEventCb);

            userPanelView.$el.find('[data-js-add]').click();

            await nextTick();

            t.equal(addEventCb.callCount, 1,
                '`add` event was triggered once');

            app.destroy();
        } finally {
            xhr.restore();
        }
    }
);

test('[Acceptance] [UserPanelView] in authorized mode click on `[data-js-submit]` button should deauthorize current' +
    ' user and widget should be in non-authorized mode [6pts]',
    async t => {
        const xhr = sinon.useFakeXMLHttpRequest();
        try {
            localStorage.clear();
            const app = new App();

            app.start();

            const userName = 'Vasya';
            const requests = [];
            xhr.onCreate = (request) => { requests.push(request) };

            app.userModel.save({ name: userName });
            _.defer(() => requests[0].respond(200,
                { "Content-Type": "application/json" },
                '{ "name": "' + userName + '", "token": "1" }'
            ));

            await waitEvent(app.userModel, 'sync');
            const userPanelView = app.getRegion('header').currentView;

            userPanelView.$el.find('[data-js-submit]').click();
            await nextTick();

            t.notOk(app.userModel.get('isLoggedIn'),
                '`app.userModel["isLoggedIn"]` is false');

            t.ok(
                _.all(
                    userPanelView.$el.find('button,textarea,input'),
                    el => !$(el).is(':disabled') || !$(el).is(':visible')
                ),
                'all active elements are not `disabled`');
            t.equal(userPanelView.$el.find('[data-js-add]:visible').length, 0,
                '`[data-js-add]` button is not present or invisible');
            t.equal(userPanelView.$el.find('[data-js-name-input]:visible').length, 1,
                '`[data-js-name-input]` input is present');
            t.equal(userPanelView.$el.find('[data-js-name-input]:visible')[0].placeholder, "Enter your name",
                '`[data-js-input]` has proper placeholder');
            t.ok(userPanelView.$el.find('[data-js-submit]:visible').length,
                '`[data-js-submit]` button is present');

            app.destroy();
        } finally {
            xhr.restore();
        }
    }
);