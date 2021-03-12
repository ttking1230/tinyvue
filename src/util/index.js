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

// 合并策略集合
let strats = {}

const LIFTCYCLE_HOOKS = [
    "beforeCreate",
    "created",
    "beforeMount",
    "mounted",
    "beforeUpdate",
    "updated",
    "beforeDetroy",
    "detroyed"
]
function mergeHook(parentVal, childVal) {
    if (childVal) {
        if (parentVal) {
            return parentVal.concat(childVal);
        } else {
            return [childVal]
        }
    } else {
        return parentVal
    }
}
LIFTCYCLE_HOOKS.forEach(hook => {
    strats[hook] = mergeHook;
})
export function mergeOptions(parent, child) {
    const options = {}
    for (let key in parent) {
        mergeField(key);
    }

    for (let key in child) {
        // 如果已经合并了，就不需要再次合并、
        if (!parent.hasOwnProperty(key)) {
            mergeField(key);
        }
    }
    // mergeField是默认的合并策略，还有一些需要特殊处理，比如data、生命周期
    function mergeField(key) {
        // 如果有自己的合并策略，执行自己的合并策略，不会使用默认的合并策略
        if (strats[key]) {
            return options[key] = strats[key](parent[key], child[key]);
        }
        if (typeof parent[key] === "object" && typeof child[key] === "object") {
            options[key] = {
                ...parent[key],
                ...child[key]
            }
        } else if (child[key] == null) {
            options[key] = parent[key];
        } else {
            console.log(key);
            console.log(child[key]);
            options[key] = child[key];
        }
    }

    return options;
}