import { nextTick } from "../util/next-tick.js"

let queue = [];
let has = {};

function flushSchedularQue() {
    queue.forEach(watcher => watcher.run());
    queue = [];
    has = {};
}
export function queueWatcher(watcher) {
    let id = watcher.id;
    if (has[id] == null) {
        queue.push(watcher);
        has[id] = true;

        // 宏任务和微任务，，vue里面使用了vue.nextTick来实现
        // vue.nextTick 优雅降级处理
        // 1、promise 2、mutationObserver 3、setImmediate 4、setTimeout

        // setTimeout(flushSchedularQue, 0);
        nextTick(flushSchedularQue);
    }
}