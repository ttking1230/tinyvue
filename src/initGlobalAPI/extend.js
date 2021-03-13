import { mergeOptions } from "../util/index.js";

let cid = 0;
export default function initExtend(Vue) {
    // 全局注册组件
    // 创建子类，继承于父类，扩展的时候都扩展都自己的属性
    // 原型继承
    Vue.extend = function (extendOptions) {
        console.log(" Vue.extend", extendOptions)
        let Sub = function vueComponent(options) {
            this._init(options);
        }
        Sub.cid = cid++;
        Sub.prototype = Object.create(this.prototype);
        Sub.prototype.constructor = Sub;
        Sub.options = mergeOptions(this.options, extendOptions);
        return Sub;
    }
}