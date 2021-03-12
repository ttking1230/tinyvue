
import { mergeOptions } from "../util/index.js"
export default function initGlobalAPI(Vue) {
    // 整合了所有的全局相关的内容
    Vue.options = {}

    // 生命周期的合并策略,同名的生命周期会合并成一个数组 [beforeCreate,beforeCreate]
    // 依次执行，不会覆盖，，其实是一个发布订阅模式
    Vue.mixin = function (mixin) {
        // 面试经常问，如何实现两个对象的合并
        this.options = mergeOptions(this.options, mixin);
    }
    console.log(Vue.options);
}