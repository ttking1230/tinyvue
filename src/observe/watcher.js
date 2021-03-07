
class Watcher {
    constructor(vm, exprOrFn, callback, options) {
        this.vm = vm;
        this.callback = callback;
        this.options = options;

        // 将内部传进来的回调方法放在getter属性上
        this.getter = exprOrFn;
        this.get();
    }
    get() {
        this.getter();
    }
}
export default Watcher