import { isObject, def } from "../util/index.js"
import { arrayMethods } from "./array.js";

class Observer {
    constructor(data) {
        // console.log(data, "Observer类")
        // 给每一个监测的属性添加 __ob__ 属性
        // 1、可判断是否为响应式对象（是否已经被监测）
        // data.__ob__ = this;
        def(data, '__ob__', this);
        if (Array.isArray(data)) {
            // 需要重写能够改变数组自身的方法，如this.arr.push({name:'zs'}) ,给新添加的属性设置get和set方法
            data.__proto__ = arrayMethods;
            // 对数组进行监测
            // 数组每一项为对象时，才进行监测
            this.observerArray(data);
        } else {
            // 对对象进行监测
            this.walk(data);
        }
    }
    observerArray(data) {
        for (let i = 0; i < data.length; i++) {
            observe(data[i]);
        }
    }
    walk(data) {
        let keys = Object.keys(data);
        for (let i = 0; i < keys.length; i++) {
            let key = keys[i];
            let value = data[key];
            defineReactive(data, key, value);
        }
    }
}

export function observe(data) {
    // console.log(data, "observe");
    // console.log(isObject(data));
    if (!isObject(data)) {
        return;
    }

    return new Observer(data);//用来观测对象
}

// 定义响应式数据，将数据变为可观测的响应式对象
function defineReactive(data, key, value) {
    // vue 数据层次过多，需要递归解析对象属性，一次添加set和get方法
    // 递归实现深度监测
    observe(value);
    Object.defineProperty(data, key, {
        get() {
            return value
        },
        set(newValue) {
            if (value === newValue) return;
            observe(newValue); //继续递归劫持用户设置的值，因为设置的值可能是一个对象，如 this.obj = {name:'zs'} => this.obj = {age: 20}
            value = newValue
        }
    })

}