import { isObject, isReservedTag } from "../util/index.js";

export function createElement(vm, tag, data = {}, ...children) {
    // console.log(tag, data, children);
    let key = data.key;
    if (key) {
        delete data.key;
    }

    // isReservedTag判断是否为html标签
    // 两种情况 1、html标签 2、组件(Vue.component,组件内components,父组件引入子组件)
    // 组件，例如<my-component></my-component>
    console.log(isReservedTag(tag))
    if (isReservedTag(tag)) {
        return vnode(tag, data, key, children, undefined);
    } else {
        // 组件
        // 根据构造函数创造虚拟节点
        let Ctor = vm.$options.components[tag];
        return createComponent(vm, tag, data, key, children, Ctor);
    }
}

export function createComponent(vm, tag, data, key, children, Ctor) {
    // Ctor为对象时，是用户定义的组件内的属性
    // 需要用Vue.extend转化为构造函数
    // components: {
    //     "my-component": {
    //        "template": "<div>111111</div>"
    //     }
    // }
    // Vue.component定义的全局组件已经经过Vue.extend转化为构造函数了
    // Vue.component("my-component", {
    //     "template": "<div>hello</div>"
    // });
    if (isObject(Ctor)) {
        Ctor = vm.$options._base.extend(Ctor);
    }
    return vnode(`vue-component-${Ctor.cid}-${tag}`, data, key, undefined, { Ctor, children });
}
export function createTextNode(vm, text) {
    // console.log(text);
    return vnode(undefined, undefined, undefined, undefined, text);
}

// 创建虚拟dom
function vnode(tag, data, key, children, text, componentOptions) {
    return {
        tag,
        data,
        key,
        children,
        text,
        componentOptions
    }
}

// 1、将template模板（html标签）转换成ast语法树 => 生成render方法  => 生成虚拟dom => 真实的dom
// 2、更新的时候重新生成虚拟dom，和上次的虚拟dom作对比，只把改变的虚拟dom重新生成真实的dom