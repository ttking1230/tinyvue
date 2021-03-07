// 判断是否是一个对象{}
export function isObject(obj) {
    return typeof obj === "object" && obj !== null;
}
export function def(obj, key, value) {
    Object.defineProperty(obj, key, {
        enumerable: false,
        configurable: false,
        value: value
    });
}

export function proxy(vm, source, key) {
    Object.defineProperty(vm, key, {
        get() {
            return vm[source][key]
        },
        set(newValue) {
            vm[source][key] = newValue
        }
    });
}