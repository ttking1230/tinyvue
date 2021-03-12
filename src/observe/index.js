import { isObject, def } from "../util/index.js"
import { arrayMethods } from "./array.js";
import Dep from "./dep.js";

class Observer {
    constructor(data) {
        // 此处的dep是给数组做依赖收集，派发更新用的
        this.dep = new Dep;
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
    // <div>{{name}}{{name}}</div>
    // 此处为闭包，当渲染watcher执行getter的时候，会去触发name的getter
    // 如上,页面上两次使用name,但都是同一个dep实例,id相同
    let dep = new Dep();// 这个dep是给对象用的

    // vue 数据层次过多，需要递归解析对象属性，一次添加set和get方法
    // 递归实现深度监测
    let childOb = observe(value);//这个value可能是数组，也可能是对象，返回的结果是Observer的实例
    Object.defineProperty(data, key, {
        get() {
            // 每个属性都对应着自己的watcher，即订阅者
            // 订阅了自己，setter的时候要去通知订阅者进行更新
            // 如果当前有wacher，需要将watcher和dep建立一个关系
            if (Dep.target) {
                dep.depend();//意味着我要将watcher存起来
                // console.log("childOb是什么：",childOb);
                if (childOb) {
                    childOb.dep.depend();// 收集了数组的相关依赖
                    // 如果数组中还有数组
                    if (Array.isArray(value)) {
                        dependArray(value);
                    }
                }
            }
            return value
        },
        set(newValue) {
            if (value === newValue) return;
            observe(newValue); //继续递归劫持用户设置的值，因为设置的值可能是一个对象，如 this.obj = {name:'zs'} => this.obj = {age: 20}
            value = newValue
            dep.notify();//通知依赖的watcher来进行更新
        }
    })

}

function dependArray(value) {
    for (let i = 0; i < value.length; i++) {
        let current = value[i];
        // 数组中的数组进行依赖收集
        current.__ob__ && current.__ob__.dep.depend();
        // 数组多层嵌套，内部还是数组，此时要递归
        if (Array.isArray(current)) {
            dependArray(current);
        }
    }
}