import Watcher from "./observe/watcher.js"
import { patch } from "./vdom/patch.js"

export default function lifecycleMixin(Vue) {
    Vue.prototype._update = function (vnode) {
        // console.log(vnode);
        let vm = this;

        // console.log(vm.$el);
        // 此时虚拟dom已经生成，通过虚拟dom vnode，去渲染出真实的dom
        // 需要用虚拟节点vnode创建出真实的节点，替换掉真实的vm.$el
        vm.$el = patch(vm.$el, vnode);
    }
}

export function mountComponent(vm, el) {
    const options = vm.$options;
    vm.$el = el;//真是的dom元素
    // console.log(options)
    callHook(vm,"beforeMount");
    // 渲染页面
    // 无论是渲染还是更新都会调用updateComponent函数 
    let updateComponent = () => {
        // 第一步：调用vm._render生成虚拟dom，vm._render调用的是options.render
        // vm._render为vue原型上的一个方法，见render.js
        // 在 调用mountComponent函数之前已经将创建的render方法挂载到了options上面
        // 第二步：vm._update 将虚拟dom生成真实的dom
        console.log("更新了几次");
        vm._update(vm._render());
    }

    // 渲染watcher，每个组件都有一个渲染watcher
    // true 表示是一个渲染watcher
    // 每次new一个实例对象的时候，都会起执行updateComponent方法

    new Watcher(vm, updateComponent, () => { }, true);
    callHook(vm,"mounted");
}

// 发布的过程
export function callHook(vm, hook) {
    let handlers = vm.$options[hook];
    if (handlers) {
        for (let i = 0; i < handlers.length; i++) {
            // call(vm) 保证用户在使用声明周期的时候，内部的this指向的是vue实例
            handlers[i].call(vm);
        }
    }
}

