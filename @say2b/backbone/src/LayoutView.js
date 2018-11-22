import Marionette from 'backbone.marionette';
import { epoxify } from './epoxify';

const LayoutView = epoxify(Marionette.LayoutView).extend({
    onConstruct(options) {
        if (this.viewModel) {
            this.listenTo(this.viewModel, 'change:disabled', (m, disabled) => this.regionManager.each(r => {
                const currentView = r.currentView;
                if (currentView) {
                    const vm = r.currentView.viewModel;
                    if (vm && vm != this.viewModel && !vm.has('parentViewModel')) {
                        r.currentView.viewModel.set('parentDisabled', disabled)
                    }
                }
            }));
        }
    }
});

export default LayoutView;