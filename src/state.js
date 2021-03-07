import { observe } from "./observe/index.js"
import { proxy } from "./util/index.js"

export default function initState(vm) {
    const options = vm.$options;
    // console.log(options);
    // vue 数据来源， 属性 方法 数据 计算属性  watch
    if (options.props) {
        initProps(vm);
    }
    if (options.methods) {
        initMethods(vm);
    }
    if (options.data) {
        initData(vm);
    }
    if (options.computed) {
        initComputed(vm);
    }
    if (options.watch) {
        initWatch(vm);
    }
}
function initProps() { }
function initMethods() { }

function initData(vm) {
    // 数据初始化工作
    let data = vm.$options.data;
    data = vm._data = typeof data === 'function' ? data.call(vm) : data;

    //做了一层代理，vm.name 代理到 vm._data.name 
    for (let key in data) {
        proxy(vm, "_data", key);
    }

    // console.log(data, "数据初始化工作")
    // 对象劫持，数据发生改变得到通知，刷新页面
    // Object.defineProperty() 给属性添加set和get方法，设置getter 和 setter
    observe(data);
}
function initComputed() { }
function initWatch() { }