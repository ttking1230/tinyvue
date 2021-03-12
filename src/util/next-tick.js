
let callBacks = [];
let waiting = false;

function flusCallback() {
    callBacks.forEach(cb => cb());
    waiting = false;
    callBacks = [];
}
export function nextTick(cb) {
    callBacks.push(cb);
    // waiting的作用：
    // 同一个tick同步代码还没执行完成，不会让它重复添加setTimeout
    if (waiting === false) {
        setTimeout(flusCallback, 0);
        waiting = true;
    }
}