export function createElement(tag, data = {}, ...children) {
    // console.log(tag, data, children);
    let key = data.key;
    if (key) {
        delete data.key;
    }
    return vnode(tag, data, key, children, undefined);
}
export function createTextNode(text) {
    // console.log(text);
    return vnode(undefined, undefined, undefined, undefined, text);
}

// 创建虚拟dom
function vnode(tag, data, key, children, text) {
    return {
        tag,
        data,
        key,
        children,
        text
    }
}

// 1、将template模板（html标签）转换成ast语法树 => 生成render方法  => 生成虚拟dom => 真实的dom
// 2、更新的时候重新生成虚拟dom，和上次的虚拟dom作对比，只把改变的虚拟dom重新生成真实的dom