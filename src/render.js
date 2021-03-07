import { createElement, createTextNode } from "./vdom/create-element.js"

export default function renderMixin(Vue) {
    // 
    // _c 创建元素的虚拟节点
    // _v 创建文本的虚拟节点
    // _s JSON，stringify
    // 使用了 with ，render.call(vm)，调用_c,_v,_s方法时，会去vm以及vm的原型上面去找这些方法
    // 巧妙的一点是，_s(val)函数执行时，传入的val即为模板中设置的属性{{name}}，因为with(this){},
    // 此时的上下文为this，即为传入的vm，即是执行vm.name，之前已做过proxy()代理，vm.name => vm._data.name

    Vue.prototype._c = function () {
        return createElement(...arguments);
    }
    Vue.prototype._v = function (text) {
        return createTextNode(text);
    }
    Vue.prototype._s = function (val) {
        return val === null ? '' : (typeof val === 'object' ? JSON.stringify(val) : val);
    }

    Vue.prototype._render = function () {
        console.log("render-----");
        const vm = this;
        let { render } = vm.$options;
        let vnode = render.call(vm);
        return vnode;
    }
}   