declare module '@say2b/backbone' {
    const Backbone: Backbone;
    const Marionette: Marionette;
    const Required: null;
    const Optional: null;

    const ajax: typeof Backbone.ajax;
    function properties(object: properties):
        <T>(T: constructor) => T
    function extendProperties(object: properties):
        <T>(T: constructor) => T
    function options(object: options):
        <T>(T: constructor) => T
    function events(object: events):
        <T>(T: constructor) => T

    interface FunctionInContextOf<T, R> {
        (this: T): R
    }

    type ResultInContextOf<T, R> = FunctionInContextOf<T, R> | R

    class Model extends Backbone.Model {
        addComputed(name: string, params: Model.Computed<Model>)
    }
    module Model {
        interface Options<M> {
            urlRoot?: ResultInContextOf<M, string>
            defaults?: ResultInContextOf<M, object>
            computeds?: {
                [ name: string ]: Model.Computed<M>
            },
            proxies?: {
                [ name: string ]: Model.Proxy
            }
        }

        interface Properties<M> extends Partial<Options<M>> { }

        interface Computed<M> {
            deps: string[]
            get: (this: M, ...args: any[]) => any
            set?: (this: M, val: any) => object
        }

        interface Proxy {
            modelAttribute: string
            submodelAttribute?: string
            readOnly?: boolean
        }

        function properties(properties: Properties<Model>):
            (target: (new (...args: any[]) => {})) => any

        function extendProperties(properties: Options<Model>):
            (target: (new (...args: any[]) => {})) => any
    }

    class Collection<M extends Model> extends Backbone.Collection<M> { }
    module Collection {
        interface Options<M extends Model> {
            model: new (...args: any[]) => M
        }

        function properties(properties: Partial<Options<Model>>):
            (target: (new (...args: any[]) => {})) => new (...args: any[]) => Collection<Model>
    }

    class ViewModel extends Model { }

    class View<M extends Model = Model> extends Marionette.View<M> {
        el: HTMLElement
        options: View.Options<View> | {}

        constructor(options?: View.Options<View>)

        onRender(): void
    }
    module View {
        interface Events<T> {
            [ event: string ]: (this: T, e: Event, ...rest: any[]) => any
        }

        interface Options<View> {
            attributes?: ResultInContextOf<View, object>
            className?: ResultInContextOf<View, string>
            tagName?: ResultInContextOf<View, string>
            events?: ResultInContextOf<View, Events<View>>
            ui?: ResultInContextOf<View, object>
            triggers?: ResultInContextOf<View, object>
        }
    }

    class EpoxyView<M extends Model = Model> extends View<M> {
        options: EpoxyView.Options<EpoxyView>
        constructor(options?: EpoxyView.Options<EpoxyView>)

        getBinding(binding: string): any
    }
    module EpoxyView {
        interface Options<View> extends View.Options<View> {
            viewModel?: ResultInContextOf<View, ViewModel>,
            computeds?: ResultInContextOf<View, object>
            bindings?: ResultInContextOf<View, object>
            bindingFilters?: ResultInContextOf<View, object>
            bindingHandlers?: ResultInContextOf<View, object>
            bindingSourcescomputeds?: ResultInContextOf<View, object>
        }
    }

    class ItemView<M extends Model = Model> extends EpoxyView<M> {
        options: ItemView.Options<ItemView, M>
        model: M
        viewModel?: ViewModel

        constructor(options?: ItemView.Options<ItemView>)
    }
    module ItemView {
        interface ModelEvents<T, M extends Model = Model> {
            [ event: string ]: (this: T, m: M, options: object, ...rest: any[]) => any
        }

        interface Options<View, M extends Model = Model> {
            model?: ResultInContextOf<View, M>,
            viewModel?: ResultInContextOf<View, ViewModel>,
            template?: Function
            className?: ResultInContextOf<View, string>
        }

        interface Properties<View, M extends Model = Model> extends Partial<EpoxyView.Options<View>> {
            options?: Partial<Options<View>>
            template?: Function | boolean
            attributes?: ResultInContextOf<View, object>
            className?: ResultInContextOf<View, string>
            tagName?: ResultInContextOf<View, string>
            templateHelpers?: ResultInContextOf<View, object>
            events?: ResultInContextOf<View, View.Events<View>>
            ui?: ResultInContextOf<View, object>
            modelEvents?: ResultInContextOf<View, ModelEvents<View, M>>
            triggers?: ResultInContextOf<View, object>
            computeds?: ResultInContextOf<View, object>
            bindings?: ResultInContextOf<View, object>
            bindingFilters?: ResultInContextOf<View, object>
            bindingHandlers?: ResultInContextOf<View, object>
            bindingSources?: ResultInContextOf<View, object>
        }

        function properties(properties: Properties<ItemView>):
            (target: (new (...args: any[]) => {})) => any

        function options(options: object):
            (target: (new (...args: any[]) => {})) => any

        function events(events: { [ event: string ]: (...args: any[]) => any } | object):
            (target: (new (...args: any[]) => {})) => any
    }

    class LayoutView<M extends Model = Model> extends ItemView<M> {
        options: LayoutView.Options<LayoutView> & object

        constructor(options?: LayoutView.Options<LayoutView>)
    }
    module LayoutView {
        interface Options<View, M extends Model = Model> extends ItemView.Options<View, M> { }

        interface Properties<View> extends ItemView.Properties<View> {
            options?: Partial<Options<View>>
            regions?: ResultInContextOf<View, object>
        }

        function properties(properties: Properties<LayoutView>):
            (target: new (...args: any[]) => {}) => any

        function options(options: object):
            (target: new (...args: any[]) => {}) => any

        function events(events: { [ event: string ]: (...args: any[]) => any } | object):
            (target: (new (...args: any[]) => {})) => any
    }

    class CollectionView<ChildModel extends Model, ChildView extends View = View> extends EpoxyView {
        options: object
        viewModel?: ViewModel
        children: CollectionView.Children<ChildView, ChildModel>

        constructor(options?: CollectionView.Options<CollectionView<ChildModel>, ChildModel>)
    }
    module CollectionView {
        interface ChildIterator<ChildView, Children, Result> {
            (view: ChildView, index: number, list: Children): Result;
        }

        interface MemoIterator<ChildView, Children, Result> {
            (memo: Result, view: ChildView, index: number, list: Children): Result;
        }

        interface Children<ChildView, ChildModel> extends Marionette.Container<ChildView> {
            each(iterator: ChildIterator<ChildView, Children<ChildView, ChildModel>, any>, context?: any):
                Children<ChildView, ChildModel>
            forEach(iterator: ChildIterator<ChildView, Children<ChildView, ChildModel>, any>, context?: any):
                Children<ChildView, ChildModel>
            reduce<T>(iterator: MemoIterator<ChildView, Children<ChildView, ChildModel>, T>, memo: T, context?: any): T
            length: number
        }

        interface CollectionEvents<T, M extends Model> {
            [ event: string ]: (this: T, m: M, collection: Collection<M>, options: object, ...rest: any[]) => any
        }

        interface ChildEvents<T, ChildView> {
            [ event: string ]: (this: T, child: ChildView, ...rest: any[]) => any
        }

        interface Options<CollectionView, ChildModel extends Model, ChildView = View> {
            collection?: ResultInContextOf<CollectionView, Collection<ChildModel>>,
            viewModel?: ResultInContextOf<CollectionView, ViewModel>,
            childView?: new (...args: any[]) => ChildView,
            getChildView?: (child: ChildModel) => new (...args: any[]) => ChildView
            childViewOptions?: object | ((this: CollectionView, child: ChildModel, index: number) => object)
        }

        enum SortResult { Less = -1, Equal = 0, Greater = 1 }

        interface Properties<CollectionView, ChildModel extends Model, ChildView = View> {
            attributes?: ResultInContextOf<CollectionView, object>
            className?: ResultInContextOf<CollectionView, string>
            tagName?: ResultInContextOf<CollectionView, string>
            childView?: new (...args: any[]) => ChildView
            getChildView?: (child: ChildModel) => new (...args: any[]) => ChildView
            childViewOptions?: object | ((this: CollectionView, child: ChildModel, index: number) => object)
            filter?: (child: ChildModel, index: number, collection: Collection<ChildModel>) => boolean
            childEvents?: ResultInContextOf<CollectionView, ChildEvents<CollectionView, ChildView>>
            collectionEvents?: ResultInContextOf<CollectionView, CollectionEvents<CollectionView, ChildModel>>
            viewComparator?:
            ((m1: ChildModel, m2: ChildModel) => SortResult) |
            ((m: ChildModel) => Date | number | string) | string
            reorderOnSort?: boolean
        }

        function properties(properties: Properties<CollectionView<Model, View>, Model>):
            (target: (new (...args: any[]) => {})) => new (...args: any[]) => CollectionView<Model, View>

        function options(options: object):
            (target: (new (...args: any[]) => {})) => new (...args: any[]) => CollectionView<Model, View>

        function events(events: { [ event: string ]: (...args: any[]) => any } | object):
            (target: (new (...args: any[]) => {})) => new (...args: any[]) => CollectionView<Model, View>
    }
}