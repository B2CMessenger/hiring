import _ from 'underscore';

const State = _.create(null, {
    Pending: Symbol('pending'),
    Resolved: Symbol('resolved'),
    Rejected: Symbol('rejected')
});

const promise = Symbol('promise'),
    state = Symbol('state'),
    resolve = Symbol('resolve'),
    reject = Symbol('reject');

class DeferredPromise {
    constructor() {
        this[promise] = new Promise((_resolve, _reject) => {
            this[resolve] = _resolve;
            this[reject] = _reject;
            this[state] = State.Pending;
        });
    }

    resolve() {
        if (this[state] == State.Pending) {
            this[state] = State.Resolved;
            this[resolve].apply(this, arguments);
            delete this[resolve];
            delete this[reject];
        }

        return this;
    }

    reject() {
        if (this[state] == State.Pending) {
            this[state] = State.Rejected;
            this[reject].apply(this, arguments);
            delete this[resolve];
            delete this[reject];
        }

        return this;
    }

    then(onFulfilled, onRejected) {
        return this[promise].then(onFulfilled, onRejected);
    }

    catch(onRejected) {
        return this[promise].catch(onRejected);
    }
};

DeferredPromise.State = State;

export default DeferredPromise;