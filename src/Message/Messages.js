import _ from 'underscore';
import { Required, Optional, CollectionView, ViewModel } from '@say2b/backbone';

/*...*/

import './Messages.scss';

@CollectionView.options({
    collection: Required,
    userModel: Required,
    parentViewModel: Optional
})
@CollectionView.events({
    'edit': (messageView, messageModel) => { }
})
@CollectionView.properties({
    className: 'messages-view',
    /*...*/
})
class MessagesView extends CollectionView {
    initialize() {
        this.viewModel = new ViewModel({
            parentViewModel: this.options.parentViewModel || null
        });

        this.userModel = this.options.userModel;
    }

    /*...*/

    onDestroy() {
        this.viewModel.destroy();
    }
}

export default MessagesView;