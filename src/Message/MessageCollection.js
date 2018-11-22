import _ from 'underscore';
import { Collection } from '@say2b/backbone';
import settings from '../settings';

import MessageModel from '../Message/MessageModel';

@Collection.properties({
    url: /*...*/,
    model: MessageModel
})
class MessageCollection extends Collection {
    /*...*/
}

export default MessageCollection;