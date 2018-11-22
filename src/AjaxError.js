function parseXhrResponse(responseType, xhr) {
    switch (responseType) {
        case 'json':
            if ('response' in xhr) {
                return xhr.responseType ? xhr.response : JSON.parse(xhr.response || xhr.responseText || 'null');
            } else {
                return JSON.parse(xhr.responseText || 'null');
            }
        case 'text':
        default:
            return ('response' in xhr) ? xhr.response : xhr.responseText;
    }
}

export default class AjaxError extends Error {
    constructor(jqXHR) {
        const message = `${jqXHR.status} ${jqXHR.statusText}`;
        super(message);

        this.message = message;
        this.jqXHR = jqXHR;
        this.status = jqXHR.status;
        this.statusText = jqXHR.statusText;
        this.responseJSON = jqXHR.responseJSON;
        this.responseText = jqXHR.responseText;
        this.response = jqXHR.responseJSON || jqXHR.responseText;
    }
};