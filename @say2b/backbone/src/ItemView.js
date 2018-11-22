import Marionette from 'backbone.marionette';
import { epoxify } from './epoxify';

const ItemView = epoxify(Marionette.ItemView);

export default ItemView;