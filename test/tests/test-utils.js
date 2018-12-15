export async function waitEvent(obj, event, timeout = 500) {
    return new Promise((resolve, reject) => {
        const cb = function () {
            obj.off(event, cb);
            clearTimeout(timer);
            resolve(arguments);
        };

        const timer = setTimeout(() => {
            obj.off(event, cb);
            reject('timed out');
        }, timeout);

        obj.on(event, cb);
    });
}

export async function nextTick(time) {
    const t = time && Math.max(time, 1) || 1;
    return new Promise(resolve => setTimeout(resolve, t));
}

export async function waitRequest(requests, timeout = 500) {
    return new Promise((resolve, reject) => {
        const interval = setInterval(() => {
            if (requests.length) {
                clearInterval(interval);
                clearTimeout(timer);
                resolve(requests.pop());
            }
        }, 10);

        const timer = setTimeout(() => {
            clearInterval(interval);
            clearTimeout(timer);
            reject('timed out');
        }, timeout);
    });
}