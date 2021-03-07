import { parseHTML } from "./parser-html.js"


const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g
// 处理属性，拼接成为属性的字符串
function genProps(attrs) {
    let str = "";
    for (let i = 0; i < attrs.length; i++) {
        let attr = attrs[i];
        if (attr.name === "style") {
            let obj = {};
            attr.value.split(";").forEach(item => {
                let [key, value] = item.split(":");
                obj[key] =  value;
            });
            attr.value = obj;
            str += `${attr.name}:${JSON.stringify(attr.value)},`
        }
    }
    return `{${str.slice(0, -1)}}`
}
function genChildren(el) {
    let children = el.children;
    if (children && children.length > 0) {
        return `${children.map(c => gen(c)).join(',')}`
    } else {
        return false;
    }
}
function gen(node) {
    if (node.type === 1) {
        // 元素标签
        return generate(node)
    } else {
        let text = node.text;
        let tokens = [];
        let match, index;
        let lastIndex = defaultTagRE.lastIndex = 0;
        while (match = defaultTagRE.exec(text)) {
            index = match.index;
            if (index > lastIndex) {
                tokens.push(JSON.stringify(text.slice(lastIndex, index)));
            }
            tokens.push(`_s(${match[1].trim()})`);
            lastIndex = index + match[0].length;
        }
        if (lastIndex < text.length) {
            tokens.push(JSON.stringify(text.slice(lastIndex)));
        }
        return `_v(${tokens.join('+')})`
    }
}
function generate(el) {
    let children = genChildren(el);
    let code = `_c("${el.tagName}",${el.attrs.length > 0 ? genProps(el.attrs) : 'undefined'
        }${children ? `,${children}` : ''
        })`

    return code;
}
export function compileToFunction(template) {
    console.log(template, 'template 转换 render方法');
    // 1、解析html字符串，将html字符串解析成ast语法树
    let root = parseHTML(template);
    console.log(root);


    // 2、需要将ast语法树生成最终的render函数,就是字符串拼接（模板引擎）
    // 核心思路就是将下面的模板转化成下面的字符串
    // 模板： <div id="app"><p>hello {{name}}</p> hello</div>
    // 将html字符串转化成ast语法树，再将ast语法树，再次转化成下面的js语法
    // 字符串： _c("div",{id:app},_c("p",undefined,_v("hello" + _s(name))),_v("hello"))

    let code = generate(root);
    console.log(code);

    //所有的模板引擎实现，都需要new Function + with
    let renderFn = new Function(`with(this){return ${code}}`);
    // renderFn = function render() { }
    // vue的render方法返回的是虚拟dom
    return renderFn //render函数
}


