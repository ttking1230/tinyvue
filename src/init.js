import initState from "./state.js"
import { compileToFunction } from "./compile/index.js"
import { mountComponent } from "./lifecycle.js"
export default function initMixin(Vue) {
    Vue.prototype._init = function (options) {
        console.log(options)
        // 数据的劫持
        const vm = this;
        // vue中this.$options 指代的就是用户定义的属性
        vm.$options = options;

        // 初始化状态
        initState(vm);


        // 用户传入 el 需要将数据渲染到页面上,实现挂载流程
        // 模板有三种方式 render template el
        // 有个顺序优先级的 render最高 

        if (vm.$options.el) {
            console.log(vm.$options.el);
            vm.$mount(vm.$options.el);
        }
    }

    Vue.prototype.$mount = function (el) {
        let vm = this;
        let options = vm.$options;
        el = document.querySelector(el);
        console.log(el)
        // 优先级，默认查找有没有render方法，没有render会去查找有没有template，
        // 没有template 会去使用 el 中的内容
        if (!options.render) {
            let template = options.template;//取出模板，如果有对模板进行编译
            if (!template && el) {
                // 没有模板，且有 el ，将el赋值给template
                template = el.outerHTML;
            }
            // 将template转化成render函数
            const render = compileToFunction(template);
            options.render = render;
        }
        // 拿到render方法之后，开始渲染当前的组件
        // vm上面可以拿到options render方法，执行render方法之后的结果替换掉 el这个标签
        mountComponent(vm, el);
    }
}