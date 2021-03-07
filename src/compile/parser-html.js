// ast语法树，用对象来描述原生（html标签语法）语法的
// 虚拟dom，用对象来描述dom节点的

const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/
// const dynamicArgAttribute = /^\s*((?:v-[\w-]+:|@|:|#)\[[^=]+\][^\s"'<>\/=]*)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/
const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`
const qnameCapture = `((?:${ncname}\\:)?${ncname})`
const startTagOpen = new RegExp(`^<${qnameCapture}`)
const startTagClose = /^\s*(\/?)>/
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`)
const doctype = /^<!DOCTYPE [^>]+>/i
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g

const comment = /^<!\--/
const conditionalComment = /^<!\[/


let root = null;//根节点 
let currentParent;//标识当前的父节点
let stack = [];
const ELEMENT_TYPE = 1;//元素类型，如div,p,span....
const TEXT_TYPE = 3;//文本类型

function createASTElement(tagName, attrs) {
    return {
        tagName: tagName,
        type: ELEMENT_TYPE,
        children: [],
        attrs: attrs,
        parent: null,
    }
}

function start(tagName, attrs) {
    console.log("开始标签：", tagName, "属性是：", attrs);
    // 遇到开始标签，就创建一个ast元素
    let element = createASTElement(tagName, attrs);
    if (!root) {
        root = element
    }
    currentParent = element;//把当前元素标记为父ast树
    stack.push(element);
}
function charts(text) {
    console.log("文本是：", text);
    text = text.replace(/\s/g, '');
    if (text) {
        currentParent.children.push({
            text,
            type: TEXT_TYPE
        });
    }
}
function end(tagName) {
    console.log("结束标签：", tagName);
    let element = stack.pop();
    currentParent = stack[stack.length - 1];
    if (currentParent) {
        element.parent = currentParent;
        currentParent.children.push(element);
    }
}


export function parseHTML(html) {
    // 循环解析html字符串
    while (html) {
        let textEnd = html.indexOf("<");
        if (textEnd === 0) {
            // 如果为0，肯定是第一个标签，且不是开始标签就是结束标签 
            // parseStartTag方法获取匹配的结果，tagName  attrs
            let startTagMatch = parseStartTag();
            if (startTagMatch) {
                start(startTagMatch.tagName, startTagMatch.attrs);
                continue;//如果开始标签匹配完毕后，继续下一次的匹配
            }
            let endTagMatch = html.match(endTag);
            if (endTagMatch) {
                advance(endTagMatch[0].length);
                end(endTagMatch[1]);
                continue;
            }
        }
        let text;
        if (textEnd >= 0) {
            text = html.substring(0, textEnd);
        }
        if (text) {
            advance(text.length);
            charts(text);
        }
    }
    function advance(n) {
        html = html.substring(n);
    }
    function parseStartTag() {
        let start = html.match(startTagOpen);//匹配第一个标签名
        if (start) {
            const match = {
                tagName: start[1],
                attrs: []
            }
            advance(start[0].length);//将标签删除
            let end, attr;
            // while 匹配属性
            while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
                advance(attr[0].length);//将属性删除
                match.attrs.push({
                    name: attr[1],
                    value: attr[3] || attr[4] || attr[5]
                })
            }
            if (end) {
                advance(end[0].length);//标签名和属性已经匹配完成，去掉开始标签的>
                return match;
            }
            console.log(match)
        }

        console.log(html)
    }
    return root;
}



// html标签转换成ast语法树
// <div id="app">
//     <p>hello</p>
// </div>
// // nodeType===1 元素    nodeType === 3 文本
// let root = {
//     tag: "div",
//     type: 1,
//     attrs: [{ name: "id", value: "app" }],
//     parent: null,
//     child: [
//         {
//             tag: "p",
//             type: 1,
//             attrs: [],
//             parent: root,
//             child: [
//                 {
//                     text: "hello",
//                     type: 3
//                 }
//             ]
//         }
//     ]
// }