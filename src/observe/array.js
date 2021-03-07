
let oldArrryMethods = Array.prototype;
export let arrayMethods = Object.create(oldArrryMethods);
const methods = [
    "push",
    "pop",
    "unshift",
    "shift",
    "reverse",
    "sort",
    "splice"
]
methods.forEach(method => {
    arrayMethods[method] = function (...args) {
        // console.log("调用数组方法！");
        // console.log(args);
        // AOP 切片编程
        // （代理或者装饰器模式），先调用重写的方法，再调用原生方法
        let result = oldArrryMethods[method].apply(this, args);
        // 当 添加的属性还是对象时，要继续对新添加的属性进行劫持，添加get和set方法，变为响应式

        let inserted;
        let ob = this.__ob__;
        switch (method) {
            case "push":
            case "unshift":
                inserted = args;
                break;
            case "splice":
                inserted = args.slice(2)
                break;
            default:
                break;
        }
        if (inserted) {
            ob.observerArray(inserted);
        }


        return result;
    }
});