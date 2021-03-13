export function patch(oldVnode, vnode) {
    // console.log("开始patch，虚拟节点vnode创建出真实的节点，替换掉真实的vm.$el");
    // console.log(oldVnode);
    // console.log(vnode);
    // console.log(oldVnode.nodeType);

    // 递归创建真实节点，替换掉老节点
    // 第一步：判断是更新还是渲染
    // 虚拟节点里面没有nodeType，真实节点里面有
    const isRealEmement = oldVnode.nodeType;
    let el;
    // 第一次渲染 oldVnode是当前的 div id="app"
    // 以后更新 oldVnode 是上一次的dom
    if (isRealEmement) {
        const oldElm = oldVnode;//当前的 div id="app"
        const parentElm = oldElm.parentNode;//body

        // vnode创建成真实dom
        el = createElm(vnode);
        // createElm(vnode)创建的新的真实dom插入到老节点的后面
        parentElm.insertBefore(el, oldElm.nextSibling);
        // 然后删除老节点,这样就完成了替换
        parentElm.removeChild(oldElm);
    }
    // console.log(el);
    return el;
}

function createElm(vnode) { //根据虚拟节点创建真实的节点
    // console.log(vnode, "根据虚拟节点创建真实的节点");
    let { tag, children, key, data, text } = vnode;

    // tag为标签，就创建标签，否则就是文本并创建
    console.log(tag);
    if (typeof tag === "string") {
        // tag为字符串时，可能是html标签也有可能是组件
        vnode.el = document.createElement(tag);
        updateProperties(vnode);
        //递归创建子节点，并将子节点添加到父节点上面 
        children.forEach(child => {
            return vnode.el.appendChild(createElm(child));
        })
    } else {
        // 创建的真实节点放在vnode上面，
        // 虚拟dom上映射着真实的dom，方便后续更新操作
        vnode.el = document.createTextNode(text);
    }

    return vnode.el
}

// 更新属性
function updateProperties(vnode) {
    let newProps = vnode.data;
    let el = vnode.el;

    for (let key in newProps) {
        if (key === "style") {
            for (let styleName in newProps.style) {
                el.style[styleName] = newProps.style[styleName];
            }
        } else if (key === "class") {
            el.className = newProps.class;
        } else {
            el.setAttribute(key, newProps[key]);
        }
    }
}