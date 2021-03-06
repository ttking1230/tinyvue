import initMixin from "./init.js"
import renderMixin from "./render.js"
import lifecycleMixin from "./lifecycle.js"
import initGlobalAPI from "./initGlobalAPI/index.js"

function Vue(options) {

    // 进行vue的初始化操作
    this._init(options);
    // console.log(options, "进行vue的初始化操作");
}

initMixin(Vue);//初始化的函数，在vue原型上面添加_init方法
renderMixin(Vue); //_render函数，在vue原型上面添加_render方法
lifecycleMixin(Vue);//_update函数，在vue原型上面添加_update方法


// 初始化全局方法，构造函数静态方法 ，例如Vue.mixin
initGlobalAPI(Vue);
export default Vue;