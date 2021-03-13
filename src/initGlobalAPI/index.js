
import { ASSETS_TYPE } from "./const.js"
import initMixin from "./mixin.js"
import initAssetRegisters from "./assets.js"
import initExtend from "./extend.js"


export default function initGlobalAPI(Vue) {
    // 整合了所有的全局相关的内容
    Vue.options = {}

    // 合并策略
    initMixin(Vue);

    // 初始化的全局过滤器，指令，组件
    ASSETS_TYPE.forEach(type => {
        Vue.options[type + "s"] = {};
    });


    // _base 是vue的构造函数
    Vue.options._base = Vue;

    // 注册extend方法
    initExtend(Vue);
    initAssetRegisters(Vue);
}