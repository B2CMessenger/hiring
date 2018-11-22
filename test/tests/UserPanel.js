import _ from 'underscore';
import test from 'blue-tape';
import sinon from 'sinon';
import { waitEvent, nextTick } from './test-utils';
import { Marionette, ViewModel } from '@say2b/backbone';
import $ from 'jquery';

import settings from '../../src/settings';
import UserModel from '../../src/User/UserModel';
import UserPanelView from '../../src/User/UserPanel';

$('body').append('<div id="region"></div>')

const region = new Marionette.Region({
    el: '#region'
});

test("non-authorized `UserPanel` has `input[data-js-name-input]` and button `[data-js-submit]`", t => {
    const userPanel = new UserPanelView({
        model: new UserModel
    });

    region.show(userPanel);

    const input$el = userPanel.$el.find('input[data-js-name-input]');
    t.ok(input$el.length == 1 && input$el[0] instanceof HTMLInputElement, '`input[data-js-name-input]` is `HTMLInputElement`');

    t.ok(/^\s*Enter your name\s*$/.test(input$el[0].placeholder), '`input[data-js-name-input]` has proper placeholder');

    const submit$el = userPanel.$el.find('[data-js-submit]');
    t.ok(submit$el.length == 1 && (submit$el[0] instanceof HTMLInputElement || submit$el[0] instanceof HTMLButtonElement),
        '`[data-js-submit]` is `HTMLInputElement` or `HTMLButtonElement`');

    region.empty();

    t.end();
});

test('non-authorized `UserPanel` `click@[data-js-submit]` should trigger `UserModel.save()` or `UserModel.fetch()`',
    async t => {
        const userPanel = new UserPanelView({
            model: new UserModel
        });

        const xhr = sinon.useFakeXMLHttpRequest();
        const requests = [];
        xhr.onCreate = (xhr) => requests.push(xhr);

        try {
            region.show(userPanel);

            await nextTick();

            const userName = 'Vasya';
            const inputEl = userPanel.$el.find('input[data-js-name-input]')[0];
            $(inputEl).val(userName).change();

            const submitEl = userPanel.$el.find('[data-js-submit]')[0];
            _.defer(() => submitEl.click());

            await waitEvent(userPanel.model, 'request');

            t.equal(requests.length, 1, 'request after `click@[data-js-submit]`');
            const request = requests.pop();
            t.equal(request.url, settings.host + '/authorize', '`request.url` is `/authorize`');
            t.equal(request.method, 'POST', '`request.method` is POST');
            t.deepEqual(JSON.parse(request.requestBody), { name: userName },
                '`request.requestBody` is `{ name: "' + userName + '" }`');
            request.error(0);
        } finally {
            xhr.restore();

            region.empty();
        }
    }
);

test('non-authorized `UserPanel` `[enter]@input[data-js-name-input]` should trigger `UserModel.save()` or `UserModel.fetch()`',
    async t => {
        const userPanel = new UserPanelView({
            model: new UserModel
        });

        const xhr = sinon.useFakeXMLHttpRequest();
        const requests = [];
        xhr.onCreate = (xhr) => requests.push(xhr);

        try {
            region.show(userPanel);

            const userName = 'Vasya';
            const inputEl = userPanel.$el.find('input[data-js-name-input]')[0];
            $(inputEl).val(userName).change();
            _.defer(() => {
                if (inputEl.form) {
                    $(inputEl).trigger('submit');
                } else {
                    $(inputEl).trigger($.Event('keypress', { keycode: 13 }));
                }
            });

            await waitEvent(userPanel.model, 'request');

            t.equal(requests.length, 1, 'request after `submit@input[data-js-name-input]`');
            const request = requests.pop();
            t.equal(request.url, settings.host + '/authorize', '`request.url` is `/authorize`');
            t.equal(request.method, 'POST', '`request.method` is POST');
            t.deepEqual(JSON.parse(request.requestBody), { name: userName },
                '`request.requestBody` is `{ name: "' + userName + '" }`');
            request.error(0);
        } finally {
            xhr.restore();

            region.empty();
        }
    }
);

test('non-authorized `UserPanel` `click@[data-js-submit]` disables `input` and `button` until request finishes',
    async t => {
        const userPanel = new UserPanelView({
            model: new UserModel
        });

        const xhr = sinon.useFakeXMLHttpRequest();
        const requests = [];
        xhr.onCreate = (xhr) => requests.push(xhr);

        try {
            region.show(userPanel);

            const userName = 'Vasya';
            const inputEl = userPanel.$el.find('input[data-js-name-input]')[0];
            $(inputEl).val(userName).change();

            const submitEl = userPanel.$el.find('[data-js-submit]')[0];
            _.defer(() => submitEl.click());

            await waitEvent(userPanel.model, 'request');
            t.equal(inputEl.disabled, true, '`input[data-js-name-input]` is disabled after request started');
            t.equal(submitEl.disabled, true, '`[data-js-submit]` is disabled after request started');
            _.defer(() => requests[0].error(0));

            await waitEvent(userPanel.model, 'error');
            t.equal(inputEl.disabled, false, '`input[data-js-name-input]` is not disabled after request finished');
            t.equal(submitEl.disabled, false, '`[data-js-submit]` is not disabled after request finished');
        } finally {
            xhr.restore();

            region.empty();
        }
    }
);