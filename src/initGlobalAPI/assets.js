import { ASSETS_TYPE } from "./const.js"

export default function initAssetRegisters(Vue) {
    ASSETS_TYPE.forEach(type => {
        Vue[type] = function (id, definition) {
            console.log(id, definition);
            if (type === "component") {
                // 注册全局组件
                // 使用extend方法，将对象definition变成构造函数
                // this.options._base 指每个组件的基类
                // this.options._base 可能是Vue 可能是子子组件的基类

                definition = this.options._base.extend(definition);
            } else if (type === "filter") {

            } else if (type === "directive") {

            }

            this.options[type + "s"][id] = definition
        }
    });
}