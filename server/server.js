const _ = require('underscore');
const restify = require('restify');
const corsMiddleware = require('restify-cors-middleware')
const port = require('./config').port;

const users = {};
let nextUserId = 1;
const userIdByName = {};
const userIdByToken = {};

function getUserByHeaders(req) {
    const hToken = req.header('token');
    if (hToken) {
        const token = String(hToken).substr(0, 255);
        const userId = userIdByToken[token];
        if (userId) {
            return users[userId];
        } else {
            return null;
        }
    } else {
        return null;
    }
}

function formatDate(date) {
    return date.toISOString().replace(/\.\d\d\dZ$/, 'Z');
}

const messages = {};
let nextMessageId = 1;

const server = restify.createServer();
const cors = corsMiddleware({
    preflightMaxAge: 9999999, //Optional
    origins: ['*'],
    allowHeaders: ['token']
})

server.pre(cors.preflight)
server.use(cors.actual)
server.use(restify.plugins.bodyParser({ mapParams: false }));

server.get('/', (req, res, next) => {
    res.send(200);
    next();
});

server.post('/authorize', (req, res, next) => {
    const name = req.body.name && _.isString(req.body.name) && req.body.name || null;
    if (name && name.length >= 3 && name.length <= 63) {
        const userId = userIdByName[name];
        if (userId) {
            const user = users[userId];
            res.json(200, user);
            return next();
        } else {
            const id = nextUserId++;
            const token = id;
            const user = {
                token,
                name
            };
            users[id] = user;
            userIdByName[name] = id;
            userIdByToken[token] = id;
            res.json(200, user);
            return next();
        }
    } else {
        res.json(422, {
            field: "name",
            message: !name || !_.isString(name) ? 'incorrect format' :
                name.length < 3 ? 'too short' : 'too long'
        });
        return next();
    }
});

server.get('/me', (req, res, next) => {
    const user = getUserByHeaders(req);

    if (user) {
        res.json(200, user);
        return next();
    } else {
        res.send(401);
        return next();
    }
});

server.get('/messages', (req, res, next) => {
    const user = getUserByHeaders(req);

    if (user) {
        res.json(200, _.values(messages));
        return next();
    } else {
        res.send(401);
        return next();
    }
});

server.post('/messages', (req, res, next) => {
    const user = getUserByHeaders(req);

    if (user) {
        const subject = req.body.subject && String(req.body.subject) || null;
        if (subject && subject.length > 255) {
            res.json(422, {
                field: "subject",
                message: 'too long'
            });

            return next();
        }

        const text = req.body.text && String(req.body.text) || null;
        if (!text || text.length < 1 || text.length > 255) {
            res.json(422, {
                field: "text",
                message: !text ? 'cannot be empty' :
                    text.length < 1 ? 'too short' : 'too long'
            });

            return next();
        }

        const id = nextMessageId++;
        const now = new Date;
        const message = {
            id,
            author: user.name,
            subject,
            text,
            charge: 0,
            created_at: formatDate(now),
            updated_at: formatDate(now)
        };
        messages[id] = message;
        res.json(201, message);
        return next();
    } else {
        res.send(401);
        return next();
    }
});

server.get('/messages/:messageId', (req, res, next) => {
    const user = getUserByHeaders(req);

    if (user) {
        const messageId = req.params.messageId;
        if (messageId) {
            const message = messages[messageId];
            if (message) {
                res.json(200, message);
                return next();
            } else {
                res.send(404);
                return next();
            }
        } else {
            res.send(404);
            return next();
        }
        
    } else {
        res.send(401);
        return next();
    }
});

server.put('/messages/:messageId', (req, res, next) => {
    const user = getUserByHeaders(req);

    if (user) {
        const messageId = req.params.messageId;
        if (messageId) {
            const message = messages[messageId];
            if (message) {
                if (message.author != user.name) {
                    res.send(403);
                    return next();
                }

                const subject = req.body.subject && String(req.body.subject) || null;
                if (subject && subject.length > 255) {
                    res.json(422, {
                        field: "subject",
                        message: 'too long'
                    });

                    return next();
                }

                const text = req.body.text && String(req.body.text) || null;
                if (!text || text.length < 1 || text.length > 255) {
                    res.json(422, {
                        field: "text",
                        message: !text ? 'cannot be empty' :
                            text.length < 1 ? 'too short' : 'too long'
                    });

                    return next();
                }

                message.subject = subject;
                message.text = text;
                message.updated_at = formatDate(new Date);

                res.json(200, message);
                return next();
            } else {
                res.send(404);
                return next();
            }
        } else {
            res.send(404);
            return next();
        }

    } else {
        res.send(401);
        return next();
    }
});

server.post('/message/delete', (req, res, next) => {
    const user = getUserByHeaders(req);

    if (user) {
        const messageId = req.body.id && String(req.body.id) || null;
        if (messageId) {
            const message = messages[messageId];
            if (message) {
                if (message.author != user.name) {
                    res.send(403);
                    return next();
                }

                if (message.charge > 0) {
                    res.json(423, { charge: message.charge });
                    return next();
                }

                delete messages[messageId];

                res.send(204);
                return next();
            } else {
                res.send(404);
                return next();
            }
        } else {
            res.send(404);
            return next();
        }

    } else {
        res.send(401);
        return next();
    }
});

server.post('/message/charge_increase', (req, res, next) => {
    const user = getUserByHeaders(req);

    if (user) {
        const messageId = req.body.id && String(req.body.id) || null;
        if (messageId) {
            const message = messages[messageId];
            if (message) {
                message.charge = Math.max(0, Math.min(message.charge + 1, 10));
                message.updated_at = formatDate(new Date)
                res.json(200, { charge: message.charge });
                return next();
            } else {
                res.send(404);
                return next();
            }
        } else {
            res.send(404);
            return next();
        }

    } else {
        res.send(401);
        return next();
    }
});

server.post('/message/charge_decrease', (req, res, next) => {
    const user = getUserByHeaders(req);

    if (user) {
        const messageId = req.body.id && String(req.body.id) || null;
        if (messageId) {
            const message = messages[messageId];
            if (message) {
                message.charge = Math.max(0, Math.min(message.charge - 1, 10));
                message.updated_at = formatDate(new Date)
                res.json(200, { charge: message.charge });
                return next();
            } else {
                res.send(404);
                return next();
            }
        } else {
            res.send(404);
            return next();
        }
    } else {
        res.send(401);
        return next();
    }
});

server.listen(port, () => {
    console.log('%s listening at %s', server.name, server.url);
});

