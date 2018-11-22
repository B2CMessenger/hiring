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

export async function nextTick() {
    await new Promise(resolve => setTimeout(resolve, 1));
}