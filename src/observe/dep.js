
let id = 0;
class Dep {
    constructor() {
        this.id = id++;
        this.subs = [];
        this.get()
    }
    get() { }
    addSub(watcher) {
        this.subs.push(watcher);
    }
    depend() {
        // this.subs.push(watcher);
        // 让当前的watcher记住我当前的dep（即属性，watcher订阅了哪个属性）
        if (Dep.target) {
            Dep.target.addDep(this);
        }
    }
    notify() {
        this.subs.forEach(watcher => watcher.update())
    }
}

let stack = []
export function pushTarget(watcher) {
    Dep.target = watcher;
    stack.push(watcher);
}

export function popTarget() {
    stack.pop();
    Dep.target = stack[stack.length - 1]
}

export default Dep