const _ = require('underscore');
const test = require('blue-tape');
const axios = require('axios');
const port = require('./config').port;

async function auth(name) {
    const response = await axios.post('/authorize', {
        name: name
    });

    return response.data.token;
}

async function post(author, subject, text) {
    const token = await auth(author);
    const response = await axios.post('/messages',
        { subject, text },
        { headers: { token } }
    );

    return response.data;
}

function check422(t, response, field) {
    t.equal(response.status, 422, '`response.status` is equal to `422`');
    const data = response.data;
    t.ok(data, 'response has `data`');
    t.equal(data.field, field, '`data.field` is equal to `' + field + '`');
    t.ok(_.isString(data.message) && data.message.length, '`data.message` is non-empty string');
}

axios.defaults.baseURL = `http://localhost:${port}`;

test("server GET `/` should return 200", async t => {
    try {
        const response = await axios.get('/');

        t.pass('GET `/` should be successful');
        t.equal(response.status, 200, '`response.status` is equal to `200`');
    } catch (error) {
        t.fail('GET `/` should be successful');
        throw error;
    }
});

test("server GET `/non-existent-path` should fail with 404", async t => {
    try {
        await axios.get('/non-existent-path');
        t.fail('GET `/non-existent-path` should not be successful');
    } catch (error) {
        t.pass('GET `/non-existent-path` should not be successful');
        t.equal(error.response.status, 404, '`response.status` is equal to `404`');
    }
});

test("server POST `/authorize` as `Vasya`", async t => {
    try {
        const response = await axios.post('/authorize', {
            name: 'Vasya'
        });

        t.pass('POST `/authorize` should be successful');
        t.equal(response.status, 200, '`response.status` is equal to `200`');
        t.ok(response.data, 'response has `data`');
        t.equal(response.data.name, 'Vasya', '`response.data.name` is equal to `Vasya`');
        t.ok(response.data.token, '`response.data.token` is ok');
    } catch (error) {
        t.fail('POST `/authorize` should be successful');
        throw error;
    }
});

test("server POST `/authorize` as `12` should fail with 422", async t => {
    try {
        await axios.post('/authorize', {
            name: '12'
        });
        t.fail('POST `/authorize` should fail');
    } catch (error) {
        t.pass('POST `/authorize` should fail');
        check422(t, error.response, 'name');
    }
});

test("server POST `/authorize` with very long name should fail with 422", async t => {
    try {
        await axios.post('/authorize', {
            name: '1234567890123456789012345678901234567890123456789012345678901234'
        });
        t.fail('POST `/authorize` should fail');
    } catch (error) {
        t.pass('POST `/authorize` should fail');
        check422(t, error.response, 'name');
    }
});

test("server GET `/authorize` should fail with 405", async t => {
    try {
        await axios.get('/authorize');
        t.fail('GET `/authorize` should not be successful');
    } catch (error) {
        t.pass('GET `/authorize` should not be successful');
        t.equal(error.response.status, 405, '`response.status` is equal to `405`');
    }
});

test("server POST `/authorize` same users should have same tokens", async t => {
    const tokens = await Promise.all([auth('Petya'), auth('Petya')]);

    t.equal(tokens[0], tokens[1], 'same users should have same tokens');
});

test("server POST `/authorize` different users should have different tokens", async t => {
    const tokens = await Promise.all([auth('Vasya'), auth('Petya'), auth('Masha')]);

    t.notEqual(tokens[0], tokens[1], 'different users should have different tokens');
    t.notEqual(tokens[1], tokens[2], 'different users should have different tokens');
    t.notEqual(tokens[2], tokens[0], 'different users should have different tokens');
});

test("server GET `/me` as `Vasya`", async t => {
    const token = await auth('Vasya');
    try {
        const response = await axios.get('/me', {
            headers: { token }
        });

        t.pass('GET `/me` should be successful');
        t.equal(response.status, 200, '`response.status` is equal to `200`');
        t.ok(response.data, 'response has `data`');
        t.equal(response.data.name, 'Vasya', '`response.data.name` is equal to `Vasya`');
        t.equal(response.data.token, token, '`response.data.token` is equal to `/authorize` token');
    } catch (error) {
        t.fail('GET `/me` should be successful');
        throw error;
    }
});

test("server GET `/me` with incorrect token should fail with 401", async t => {
    const tokens = ['incorrect token', null, '-1', 0, false]

    for (const token of tokens) {
        try {
            await axios.get('/me', { headers: { token } });
            t.fail('GET `/me` with incorrect token `' + token + '` should fail');
        } catch (error) {
            t.pass('GET `/me` with incorrect token `' + token + '` should fail');
            t.equal(error.response.status, 401, '`response.status` is equal to `401`');
        }
    }
});

test("server GET `/me` without token should fail with 401", async t => {
    try {
        await axios.get('/me');
        t.fail('GET `/me` with incorrect token should fail');
    } catch (error) {
        t.pass('GET `/me` with incorrect token should fail');
        t.equal(error.response.status, 401, '`response.status` is equal to `401`');
    }
});

test("server POST `/messages` message with text and subject", async t => {
    const author = 'Vasya';
    const subject = 'First message';
    const text = 'Hello, world! Lorem ipsum dolor sit amet, consectetur adipiscing elit';
    const token = await auth(author);

    try {
        const now = new Date;
        const response = await axios.post('/messages', { subject, text }, { headers: { token } });

        t.pass('POST `/messages` should be successful');
        t.equal(response.status, 201, '`response.status` is equal to `201`');
        t.ok(response.data, 'response has `data`');
        t.ok(response.data.id && _.isNumber(response.data.id), '`data.id` is Number');
        t.equal(response.data.author, author, '`data.author` is equal to `' + author + '`');
        t.equal(response.data.subject, subject, '`data.subject` is equal to `' + subject + '`');
        t.equal(response.data.text, text, '`data.text` is equal to `' + text + '`');
        t.equal(response.data.charge, 0, '`data.charge` is `0`');
        const created_at = response.data.created_at;
        t.ok(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z/.test(created_at), '`data.created_at` has proper format');
        t.ok(Math.abs(now - new Date(created_at)) < 2000, '`data.created_at` has proper value');
        t.equal(created_at, response.data.updated_at, '`data.updated_at` equal to `data.created_at`');

    } catch (error) {
        t.fail('POST `/messages` should be successful');
        throw error;
    }
});

test("server POST `/messages` as `Vasya` message with text and empty or falsey subject", async t => {
    const author = 'Vasya';
    const subjects = ['', null, false, 0, undefined];
    const text = 'Hello, world! Lorem ipsum dolor sit amet, consectetur adipiscing elit';
    const token = await auth(author);

    for (const subject of subjects) {
        try {
            const response = await axios.post('/messages', { subject, text }, { headers: { token } });

            t.pass('POST `/messages` should be successful');
            t.equal(response.status, 201, '`response.status` is equal to `201`');
            t.ok(response.data, 'response has `data`');
            t.ok(response.data.id && _.isNumber(response.data.id), '`response,data.id` is Number');
            t.equal(response.data.author, author, '`response.data.author` is equal to `' + author + '`');
            t.equal(response.data.subject, null, '`response.data.subject` is equal to `null`');
            t.equal(response.data.text, text, '`response.data.text` is equal to `' + text + '`');
            t.equal(response.data.charge, 0, '`response.data.charge` is `0`');

        } catch (error) {
            t.fail('POST `/messages` should be successful');
            throw error;
        }
    }
});

test("server POST `/messages` with incorrect token should fail with 401", async t => {
    const tokens = ['incorrect token', null, '-1', 0, false, undefined]

    for (const token of tokens) {
        const options = _.isUndefined(token) ? {} : { headers: { token } };
        try {
            await axios.post('/messages', {}, options);
            t.fail('POST `/messages` with incorrect token `' + token + '` should fail')
        } catch (error) {
            t.pass('POST `/messages` with incorrect token `' + token + '` should fail');
            t.equal(error.response.status, 401, '`response.status` is equal to `401`');
        }
    }
});

test("server POST `/messages` message with incorrect text should fail with 422", async t => {
    const author = 'Vasya';
    const subject = '';
    const texts = ['', undefined, null, false, 'wVZhRALNk2UQ8ZuAPkI8zzka4xJjJJEnscMpxJWGRhWtnbxboih8JfWM9U8ocnVzl7iFF' +
        'pJnPHljgVnPcbDfbcqWDPOjk04oquISMo6o3ZbOn4rCPlX3kVenP4CocM5TEXp5zh2uejFnycANPhX35MAn9yTTiCNQcwh2NjaF5vF8jj9FQ' +
        'BCu8n8hXMztoqwkl1WtIOXjZUs0LVKbAqKxS79yHZ1UxR0oTPEoZg24fN7p401GeZfaoYnFSysEoKf5', 0];

    for (const text of texts) {
        try {
            await post(author, subject, text);
            t.fail('POST `/messages` should fail')
        } catch (error) {
            t.pass('POST `/messages` should fail');
            check422(t, error.response, 'text');
        }
    }
});

test("server POST `/messages` message with too long subject should fail with 422", async t => {
    const author = 'Vasya';
    const subject = 'wVZhRALNk2UQ8ZuAPkI8zzka4xJjJJEnscMpxJWGRhWtnbxboih8JfWM9U8ocnVzl7iFFpJnPHljgVnPcbDfbcqWDPOjk04o' +
        'quISMo6o3ZbOn4rCPlX3kVenP4CocM5TEXp5zh2uejFnycANPhX35MAn9yTTiCNQcwh2NjaF5vF8jj9FQBCu8n8hXMztoqwkl1WtIOXjZUs0' +
        'LVKbAqKxS79yHZ1UxR0oTPEoZg24fN7p401GeZfaoYnFSysEoKf5';
    const text = 'Some text';

    try {
        await post(author, subject, text);
        t.fail('POST `/messages` should fail')
    } catch (error) {
        t.pass('POST `/messages` should fail');
        check422(t, error.response, 'subject');
    }
});

test("server GET `/messages`", async t => {
    const message = await post('Vasya', 'subject', 'text');
    const token = await auth('Petya');

    try {
        const response = await axios.get('/messages', { headers: { token } });
        t.pass('GET `/messages` should be successful');
        t.equal(response.status, 200, '`response.status` is equal to `200`');
        const data = response.data;
        t.ok(_.isArray(data) && data.length > 0, '`response.data` is non-empty Array');
        const m = _.find(data, m => m.id == message.id);
        t.ok(m, '`data` has `message` posted before by `Vasya`');
        t.equal(m.author, message.author, '`message` has proper `author`');
        t.equal(m.subject, message.subject, '`message` has proper `subject`');
        t.equal(m.text, message.text, '`message` has proper `text`');
        t.equal(m.charge, message.charge, '`message` has proper `charge`');
    } catch (error) {
        t.fail('GET `/messages` should be successful');
        throw error;
    }
});

test("server GET `/messages` previously posted", async t => {
    const message1 = await post('Vasya', 'subject1', 'text1');
    const message2 = await post('Petya', 'subject2', 'text2');
    try {
        await post('Masha', 'subject3', '');
    } catch (error) { }
    const message3 = await post('Masha', 'subject3', 'text3');

    const token = await auth('Borya');

    try {
        const data = (await axios.get('/messages', { headers: { token } })).data;
        t.ok(_.isArray(data) && data.length >= 3, '`response.data` is non-empty Array');
        const m1 = _.findWhere(data, message1);
        t.ok(m1, '`data` has `message1`');
        const m2 = _.findWhere(data, message2);
        t.ok(m2, '`data` has `message2`');
        const m3 = _.findWhere(data, message3);
        t.ok(m3, '`data` has `message3`');

        t.ok(_.every(data, m => m.id > 0 && m.text.length && _.isNumber(m.charge) && m.author.length),
            'All messages has proper values');

    } catch (error) {
        t.fail('GET `/messages` should be successful');
        throw error;
    }
});

test("server GET `/messages` with incorrect token should fail with 401", async t => {
    const tokens = ['incorrect token', null, '-1', 0, false, undefined]

    for (const token of tokens) {
        const options = _.isUndefined(token) ? {} : { headers: { token } };
        try {
            await axios.get('/messages', options);
            t.fail('GET `/messages` with incorrect token `' + token + '` should fail')
        } catch (error) {
            t.pass('GET `/messages` with incorrect token `' + token + '` should fail');
            t.equal(error.response.status, 401, '`response.status` is equal to `401`');
        }
    }
});

test("server GET `/messages/{id}`", async t => {
    const message = await post('Vasya', 'subject', 'text');
    const token = await auth('Petya');

    try {
        const response = await axios.get(`/messages/${message.id}`, { headers: { token } });
        t.pass('GET `/messages/' + message.id + '` should be successful');
        t.equal(response.status, 200, '`response.status` is equal to `200`');
        const data = response.data;
        t.ok(_.isObject(data), '`response.data` is Object');
        t.equal(data.author, message.author, '`message` has proper `author`');
        t.equal(data.subject, message.subject, '`message` has proper `subject`');
        t.equal(data.text, message.text, '`message` has proper `text`');
        t.equal(data.charge, message.charge, '`message` has proper `charge`');
    } catch (error) {
        t.fail('GET `/messages/' + message.id + '` should be successful');
        throw error;
    }
});

test("server GET `/messages/{id}` with incorrect id should fail with 404", async t => {
    const token = await auth('Petya');
    const messages = (await axios.get('/messages', { headers: { token } })).data;
    const maxMessageId = _.max(messages, m => m.id).id;
    const ids = ['', null, '-1', 0, false, undefined, maxMessageId + 1];

    for (const id of ids) {
        try {
            await axios.get(`/messages/${id}`, { headers: { token } });
            t.fail('GET `/messages/' + id + '` with incorrect id `' + id + '` should fail')
        } catch (error) {
            t.pass('GET `/messages/' + id + '` with incorrect id `' + id + '` should fail');
            t.equal(error.response.status, 404, '`response.status` is equal to `404`');
        }
    }
});

test("server GET `/messages/{id}` with incorrect token should fail with 401", async t => {
    const id = 1;
    const tokens = ['incorrect token', null, '-1', 0, false, undefined]

    for (const token of tokens) {
        const options = _.isUndefined(token) ? {} : { headers: { token } };
        try {
            await axios.get(`/messages/${id}`, options);
            t.fail('GET `/messages/' + id + '` with incorrect token `' + token + '` should fail')
        } catch (error) {
            t.pass('GET `/messages/' + id + '` with incorrect token `' + token + '` should fail');
            t.equal(error.response.status, 401, '`response.status` is equal to `401`');
        }
    }
});

test("server PUT `/messages/{id}` update message with text and subject", async t => {
    const author = 'Vasya';
    const subject = 'First message';
    const text = 'Hello, world! Lorem ipsum dolor sit amet, consectetur adipiscing elit';
    const token = await auth('Vasya');
    const message = await post(author, 'subject', 'text');
    const created_at = message.created_at;
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
        const now = new Date;
        const response = await axios.put(`/messages/${message.id}`, { subject, text }, { headers: { token } });

        t.pass('PUT `/messages/{id}` should be successful');
        t.equal(response.status, 200, '`response.status` is equal to `200`');
        t.ok(response.data, 'response has `data`');
        const data = response.data;
        t.equal(data.id, message.id, '`data.id` is equal to posted `message.id`');
        t.equal(data.author, message.author, '`data.author` is equal to `message.author`');
        t.equal(data.subject, subject, '`data.subject` is equal to `' + subject + '`');
        t.equal(data.text, text, '`data.text` is equal to `' + text + '`');
        t.equal(data.charge, 0, '`data.charge` is `0`');
        t.equal(data.created_at, created_at, '`data.created_at` not changed');
        const updated_at = data.updated_at;
        t.ok(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z/.test(updated_at), '`data.updated_at` has proper format');
        t.ok(Math.abs(now - new Date(updated_at)) < 2000, '`data.updated_at` has proper value');
        t.ok(new Date(data.created_at) < new Date(updated_at),
            '`data.created_at` less than `data.updated_at`');

    } catch (error) {
        t.fail('PUT `/messages/{id}` should be successful');
        throw error;
    }
});

test("server PUT `/messages/{id}` update message with text and empty or falsey subject", async t => {
    const author = 'Vasya';
    const subjects = ['', null, false, 0, undefined];
    const text = 'Hello, world! Lorem ipsum dolor sit amet, consectetur adipiscing elit';
    const token = await auth('Vasya');
    const message = await post(author, 'subject', 'text');

    for (const subject of subjects) {
        try {
            const response = await axios.put(`/messages/${message.id}`, { subject, text }, { headers: { token } });

            t.pass('PUT `/messages/{id}` should be successful');
            t.equal(response.status, 200, '`response.status` is equal to `200`');
            t.ok(response.data, 'response has `data`');
            const data = response.data;
            t.equal(data.id, message.id, '`data.id` is equal to posted `message.id`');
            t.equal(data.author, message.author, '`data.author` is equal to `message.author`');
            t.equal(data.subject, null, '`data.subject` is equal to `null`');
            t.equal(data.text, text, '`data.text` is equal to `' + text + '`');
            t.equal(data.charge, 0, '`data.charge` is `0`');

        } catch (error) {
            t.fail('PUT `/messages/{id}` should be successful');
            throw error;
        }
    }
});

test("server PUT `/messages/{id}` with incorrect token should fail with 401", async t => {
    const id = 1;
    const subject = 'First message';
    const text = 'Hello, world! Lorem ipsum dolor sit amet, consectetur adipiscing elit';
    const tokens = ['incorrect token', null, '-1', 0, false, undefined]

    for (const token of tokens) {
        const options = _.isUndefined(token) ? {} : { headers: { token } };
        try {
            await axios.put(`/messages/${id}`, { subject, text }, options);
            t.fail('PUT `/messages/{id}` with incorrect token `' + token + '` should fail')
        } catch (error) {
            t.pass('PUT `/messages/{id}` with incorrect token `' + token + '` should fail');
            t.equal(error.response.status, 401, '`response.status` is equal to `401`');
        }
    }
});

test("server PUT `/messages/{id}` from another author should fail with 403", async t => {
    const token = await auth('Vasya');
    const subject = 'First message';
    const text = 'Hello, world! Lorem ipsum dolor sit amet, consectetur adipiscing elit';
    const message = await post('Petya', 'subject', 'text');

    try {
        await axios.put(`/messages/${message.id}`, { subject, text }, { headers: { token } });
        t.fail('PUT `/messages/{id}` from another author should fail')
    } catch (error) {
        t.pass('PUT `/messages/{id}` from another author should fail');
        t.equal(error.response.status, 403, '`response.status` is equal to `403`');
    }
});

test("server PUT `/messages/{id}` with incorrect id should fail with 404", async t => {
    const token = await auth('Petya');
    const subject = 'First message';
    const text = 'Hello, world! Lorem ipsum dolor sit amet, consectetur adipiscing elit';
    const messages = (await axios.get('/messages', { headers: { token } })).data;
    const maxMessageId = _.max(messages, m => m.id).id;
    const ids = ['', null, '-1', 0, false, undefined, maxMessageId + 1];

    for (const id of ids) {
        try {
            await axios.put(`/messages/${id}`, { subject, text }, { headers: { token } });
            t.fail('PUT `/messages/' + id + '` with incorrect id `' + id + '` should fail')
        } catch (error) {
            t.pass('PUT `/messages/' + id + '` with incorrect id `' + id + '` should fail');
            t.equal(error.response.status, 404, '`response.status` is equal to `404`');
        }
    }
});

test("server PUT `/messages/{id}` message with incorrect text should fail with 422", async t => {
    const author = 'Vasya';
    const subject = '';
    const texts = ['', undefined, null, false, 'wVZhRALNk2UQ8ZuAPkI8zzka4xJjJJEnscMpxJWGRhWtnbxboih8JfWM9U8ocnVzl7iFF' +
        'pJnPHljgVnPcbDfbcqWDPOjk04oquISMo6o3ZbOn4rCPlX3kVenP4CocM5TEXp5zh2uejFnycANPhX35MAn9yTTiCNQcwh2NjaF5vF8jj9FQ' +
        'BCu8n8hXMztoqwkl1WtIOXjZUs0LVKbAqKxS79yHZ1UxR0oTPEoZg24fN7p401GeZfaoYnFSysEoKf5', 0];
    const token = await auth('Vasya');
    const message = await post(author, 'subject', 'text');

    for (const text of texts) {
        try {
            await axios.put(`/messages/${message.id}`, { subject, text }, { headers: { token } });
            t.fail('PUT `/messages/{id}` should fail')
        } catch (error) {
            t.pass('PUT `/messages/{id}` should fail');
            check422(t, error.response, 'text');
        }
    }
});

test("server PUT `/messages/{id}` as `Vasya` message with too long subject should fail with 422", async t => {
    const author = 'Vasya';
    const subject = 'wVZhRALNk2UQ8ZuAPkI8zzka4xJjJJEnscMpxJWGRhWtnbxboih8JfWM9U8ocnVzl7iFFpJnPHljgVnPcbDfbcqWDPOjk04o' +
        'quISMo6o3ZbOn4rCPlX3kVenP4CocM5TEXp5zh2uejFnycANPhX35MAn9yTTiCNQcwh2NjaF5vF8jj9FQBCu8n8hXMztoqwkl1WtIOXjZUs0' +
        'LVKbAqKxS79yHZ1UxR0oTPEoZg24fN7p401GeZfaoYnFSysEoKf5';
    const text = 'Some text';
    const token = await auth('Vasya');
    const message = await post(author, 'subject', 'text');

    try {
        await axios.put(`/messages/${message.id}`, { subject, text }, { headers: { token } });
        t.fail('PUT `/messages/{id}` should fail')
    } catch (error) {
        t.pass('PUT `/messages/{id}` should fail');
        check422(t, error.response, 'subject');
    }
});

test("server PUT `/messages/{id}` message should update GET `/messages` result", async t => {
    const author = 'Vasya';
    const subject = 'First message';
    const text = 'Hello, world! Lorem ipsum dolor sit amet, consectetur adipiscing elit';
    const token = await auth('Vasya');

    const message = await post(author, 'subject', 'text');
    {
        const messages = (await axios.get('/messages', { headers: { token } })).data
        t.ok(_.findWhere(messages, message), 'messages has message')
    }
    {
        const changed = (await axios.put(`/messages/${message.id}`, { subject, text }, { headers: { token } })).data;
        const messages = (await axios.get('/messages', { headers: { token } })).data
        t.ok(_.findWhere(messages, changed), 'messages has updated message')
    }
});

test("server POST `/message/delete`", async t => {
    const author = 'Vasya';
    const token = await auth(author);
    const message = await post(author, 'subject', 'text');

    try {
        const response = await axios.post(`/message/delete`, { id: message.id }, { headers: { token } });

        t.pass('POST `/message/delete` should be successful');
        t.equal(response.status, 204, '`response.status` is equal to `204`');

    } catch (error) {
        t.fail('POST `/message/delete` should be successful');
        throw error;
    }
});

test("server POST `/message/delete` with incorrect token should fail with 401", async t => {
    const id = 1;
    const tokens = ['incorrect token', null, '-1', 0, false, undefined]

    for (const token of tokens) {
        const options = _.isUndefined(token) ? {} : { headers: { token } };
        try {
            await axios.post(`/message/delete`, { id: id }, options);
            t.fail('POST `/message/delete` with incorrect token `' + token + '` should fail')
        } catch (error) {
            t.pass('POST `/message/delete` with incorrect token `' + token + '` should fail');
            t.equal(error.response.status, 401, '`response.status` is equal to `401`');
        }
    }
});

test("server POST `/message/delete` from another author should fail with 403", async t => {
    const token = await auth('Vasya');
    const message = await post('Petya', 'subject', 'text');

    try {
        await axios.post(`/message/delete`, { id: message.id }, { headers: { token } });
        t.fail('POST `/message/delete` from another author should fail')
    } catch (error) {
        t.pass('POST `/message/delete` from another author should fail');
        t.equal(error.response.status, 403, '`response.status` is equal to `403`');
    }
});

test("server POST `/message/delete` with incorrect id should fail with 404", async t => {
    const token = await auth('Petya');
    const messages = (await axios.get('/messages', { headers: { token } })).data;
    const maxMessageId = _.max(messages, m => m.id).id;
    const ids = ['', null, '-1', 0, false, undefined, maxMessageId + 1];

    for (const id of ids) {
        try {
            await axios.post(`/message/delete`, { id }, { headers: { token } });
            t.fail('POST `/message/delete` with incorrect id `' + id + '` should fail')
        } catch (error) {
            t.pass('POST `/message/delete` with incorrect id `' + id + '` should fail');
            t.equal(error.response.status, 404, '`response.status` is equal to `404`');
        }
    }
});

test("server POST `/message/delete` message with charge should fail with 423", async t => {
    const author = 'Vasya';
    const token = await auth(author);
    const message = await post(author, 'subject', 'text');
    await axios.post('/message/charge_increase', { id: message.id }, { headers: { token } });
    _.extend(message, (await axios.get(`/messages/${message.id}`, { headers: { token } })).data);

    t.ok(message.charge > 0, 'message has `charge > 0`');

    try {
        await axios.post(`/message/delete`, { id: message.id }, { headers: { token } });
        t.fail('POST `/message/delete` message with charge should fail')
    } catch (error) {
        t.pass('POST `/message/delete` message with charge should fail');
        t.equal(error.response.status, 423, '`response.status` is equal to `423`');
        const data = error.response.data;
        t.equal(data.charge, message.charge, '`data.charge` equal to `message.charge`');
    }
});

test("server POST `/message/delete` should update GET `/messages` result", async t => {
    const author = 'Vasya';
    const token = await auth(author);

    const message = await post(author, 'subject', 'text');
    {
        const messages = (await axios.get('/messages', { headers: { token } })).data
        t.ok(_.findWhere(messages, message), 'messages has message');
    }
    {
        await axios.post(`/message/delete`, { id: message.id }, { headers: { token } })
        const messages = (await axios.get('/messages', { headers: { token } })).data
        t.equal(_.filter(messages, m => m.id == message.id).length, 0, 'messages has no message');
    }
});

test("server post 1,2 messages, delete 2 and post 3", async t => {
    const author = 'Vasya';
    const token = await auth(author);
    const message1 = await post(author, 'subject', 'text');
    const message2 = await post(author, 'subject', 'text');

    {
        const messages = (await axios.get('/messages', { headers: { token } })).data
        t.ok(_.findWhere(messages, message1) && _.findWhere(messages, message2), 'messages has message1 and message2');
    }
    await axios.post(`/message/delete`, { id: message2.id }, { headers: { token } });
    const message3 = await post(author, 'subject', 'text');
    {

        const messages = (await axios.get('/messages', { headers: { token } })).data
        t.equal(_.filter(messages, m => m.id == message2.id).length, 0, 'messages has no message2');
        t.ok(_.findWhere(messages, message1) && _.findWhere(messages, message3), 'messages has message1 and message3');
    }
});

test("server POST `/message/charge_increase`", async t => {
    const author = 'Vasya';
    const token = await auth(author);
    const message = await post(author, 'subject', 'text');

    try {
        const response = await axios.post(`/message/charge_increase`, { id: message.id }, { headers: { token } });
        t.pass('POST `/message/charge_increase` should be successful');
        t.equal(response.status, 200, '`response.status` is equal to `200`');
        t.ok(response.data, 'response has `data`');
        const data = response.data;
        t.equal(data.charge, message.charge + 1, '`data.charge` is equal to posted `message.charge + 1`');
    } catch (error) {
        t.fail('POST `/message/charge_increase` should be successful');
        throw error;
    }
});

test("server POST `/message/charge_increase` caps at 10 and message cannot be deleted", async t => {
    const author = 'Vasya';
    const token = await auth(author);
    const message = await post(author, 'subject', 'text');

    for (let charge = 1; charge <= 10; charge++) {
        const response = await axios.post(`/message/charge_increase`, { id: message.id }, { headers: { token } });
        _.extend(message, (await axios.get(`/messages/${message.id}`, { headers: { token } })).data);
        t.equal(response.data.charge, charge, '`response.data.charge` has proper charge `' + charge + '`');
        t.equal(charge, message.charge, 'updated message has proper charge `' + charge + '`');
        try {
            await axios.post(`/message/delete`, { id: message.id }, { headers: { token } });
            t.fail('`message` with `charge > 0` cannot be deleted');
        } catch (error) {
            t.ok(error.response.status == 423, '`message` with `charge > 0` cannot be deleted');
        }
    }

    t.equal(message.charge, 10, 'message has `charge == 10`');
    await axios.post(`/message/charge_increase`, { id: message.id }, { headers: { token } });
    _.extend(message, (await axios.get(`/messages/${message.id}`, { headers: { token } })).data);
    t.equal(message.charge, 10, '`charge` caps at 10');
});

test("server POST `/message/charge_increase` with incorrect token should fail with 401", async t => {
    const id = 1;
    const tokens = ['incorrect token', null, '-1', 0, false, undefined]

    for (const token of tokens) {
        const options = _.isUndefined(token) ? {} : { headers: { token } };
        try {
            await axios.post(`/message/charge_increase`, { id: id }, options);
            t.fail('POST `/message/charge_increase` with incorrect token `' + token + '` should fail')
        } catch (error) {
            t.pass('POST `/message/charge_increase` with incorrect token `' + token + '` should fail');
            t.equal(error.response.status, 401, '`response.status` is equal to `401`');
        }
    }
});

test("server POST `/message/charge_increase` with incorrect id should fail with 404", async t => {
    const token = await auth('Petya');
    const messages = (await axios.get('/messages', { headers: { token } })).data;
    const maxMessageId = _.max(messages, m => m.id).id;
    const ids = ['', null, '-1', 0, false, undefined, maxMessageId + 1];

    for (const id of ids) {
        try {
            await axios.post(`/message/charge_increase`, { id }, { headers: { token } });
            t.fail('POST `/message/charge_increase` with incorrect id `' + id + '` should fail')
        } catch (error) {
            t.pass('POST `/message/charge_increase` with incorrect id `' + id + '` should fail');
            t.equal(error.response.status, 404, '`response.status` is equal to `404`');
        }
    }
});

test("server POST `/message/charge_decrease`", async t => {
    const author = 'Vasya';
    const token = await auth(author);
    const message = await post(author, 'subject', 'text');
    for (let charge = message.charge; charge <= 5; charge++) {
        await axios.post(`/message/charge_increase`, { id: message.id }, { headers: { token } });
        _.extend(message, (await axios.get(`/messages/${message.id}`, { headers: { token } })).data);
    }

    try {
        const response = await axios.post(`/message/charge_decrease`, { id: message.id }, { headers: { token } });
        t.pass('POST `/message/charge_decrease` should be successful');
        t.equal(response.status, 200, '`response.status` is equal to `200`');
        t.ok(response.data, 'response has `data`');
        const data = response.data;
        t.equal(data.charge, message.charge - 1, '`data.charge` is equal to posted `message.charge - 1`');
    } catch (error) {
        t.fail('POST `/message/charge_decrease` should be successful');
        throw error;
    }
});

test("server POST `/message/charge_decrease` stops at 0 and message cannot be deleted until", async t => {
    const author = 'Vasya';
    const token = await auth(author);
    const message = await post(author, 'subject', 'text');
    for (let charge = message.charge; charge <= 10; charge++) {
        await axios.post(`/message/charge_increase`, { id: message.id }, { headers: { token } });
        _.extend(message, (await axios.get(`/messages/${message.id}`, { headers: { token } })).data);
    }

    for (let charge = message.charge - 1; charge >= 0; charge--) {
        const response = await axios.post(`/message/charge_decrease`, { id: message.id }, { headers: { token } });
        _.extend(message, (await axios.get(`/messages/${message.id}`, { headers: { token } })).data);
        t.equal(response.data.charge, charge, '`response.data.charge` has proper charge `' + charge + '`');
        t.equal(charge, message.charge, 'updated message has proper charge `' + charge + '`');
        if (charge > 0) {
            try {
                await axios.post(`/message/delete`, { id: message.id }, { headers: { token } });
                t.fail('`message` with `charge > 0` cannot be deleted');
            } catch (error) {
                t.ok(error.response.status == 423, '`message` with `charge > 0` cannot be deleted');
            }
        }
    }

    t.equal(message.charge, 0, 'message has `charge == 0`');
    await axios.post(`/message/charge_decrease`, { id: message.id }, { headers: { token } });
    _.extend(message, (await axios.get(`/messages/${message.id}`, { headers: { token } })).data);
    t.equal(message.charge, 0, '`charge` cannot be less than 0');

    try {
        await axios.post(`/message/delete`, { id: message.id }, { headers: { token } });
        t.pass('`message` with `charge == 0` can be deleted');
    } catch (error) {
        t.fail('`message` with `charge == 0` can be deleted');
    }
});

test("server POST `/message/charge_decrease` with incorrect token should fail with 401", async t => {
    const id = 1;
    const tokens = ['incorrect token', null, '-1', 0, false, undefined]

    for (const token of tokens) {
        const options = _.isUndefined(token) ? {} : { headers: { token } };
        try {
            await axios.post(`/message/charge_decrease`, { id: id }, options);
            t.fail('POST `/message/charge_decrease` with incorrect token `' + token + '` should fail')
        } catch (error) {
            t.pass('POST `/message/charge_decrease` with incorrect token `' + token + '` should fail');
            t.equal(error.response.status, 401, '`response.status` is equal to `401`');
        }
    }
});

test("server POST `/message/charge_decrease` with incorrect id should fail with 404", async t => {
    const token = await auth('Petya');
    const messages = (await axios.get('/messages', { headers: { token } })).data;
    const maxMessageId = _.max(messages, m => m.id).id;
    const ids = ['', null, '-1', 0, false, undefined, maxMessageId + 1];

    for (const id of ids) {
        try {
            await axios.post(`/message/charge_decrease`, { id }, { headers: { token } });
            t.fail('POST `/message/charge_decrease` with incorrect id `' + id + '` should fail')
        } catch (error) {
            t.pass('POST `/message/charge_decrease` with incorrect id `' + id + '` should fail');
            t.equal(error.response.status, 404, '`response.status` is equal to `404`');
        }
    }
});