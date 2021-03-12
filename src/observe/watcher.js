import { pushTarget, popTarget } from "./dep.js"
// schedular：调度
import { queueWatcher } from "./schedular.js"

let id = 0;
class Watcher {
    constructor(vm, exprOrFn, callback, options) {
        this.vm = vm;
        this.callback = callback;
        this.options = options;
        this.id = id++;

        this.deps = []
        this.depsId = new Set();

        // 将内部传进来的回调方法放在getter属性上
        this.getter = exprOrFn;
        // 调用get方法，会让渲染watcher执行
        this.get();
    }
    get() {
        // 把当前的watcher存起来，存在dep里面
        pushTarget(this);
        // 渲染watcher的执行，此时会调用vm_update(vm._render),
        // 此时会去取值，会触发属性的getter
        this.getter();
        // 移除watcher
        popTarget();
    }
    addDep(dep) {
        // watcher里面不能存放重复的dep，dep里面也不能存放重复的watcher
        let id = dep.id;
        if (!this.depsId.has(id)) {
            this.depsId.add(id);
            this.deps.push(dep);
            dep.addSub(this);
        }
    }
    update() {
        // this.get();
        // 异步更新，等同步任务执行完成之后，再去执行更新
        // 此时还是同步，通过nextTick来变成异步任务，放到下一个tick去执行
        
        queueWatcher(this);
    }
    run() {
        this.get();
    }
}


export default Watcher