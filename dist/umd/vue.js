(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
}(this, (function () { 'use strict';

    // 判断是否是一个对象{}
    function isObject(obj) {
      return typeof obj === "object" && obj !== null;
    }
    function def(obj, key, value) {
      Object.defineProperty(obj, key, {
        enumerable: false,
        configurable: false,
        value: value
      });
    }
    function proxy(vm, source, key) {
      Object.defineProperty(vm, key, {
        get() {
          return vm[source][key];
        },

        set(newValue) {
          vm[source][key] = newValue;
        }

      });
    } // 合并策略集合

    let strats = {};
    const LIFTCYCLE_HOOKS = ["beforeCreate", "created", "beforeMount", "mounted", "beforeUpdate", "updated", "beforeDetroy", "detroyed"];

    function mergeHook(parentVal, childVal) {
      if (childVal) {
        if (parentVal) {
          return parentVal.concat(childVal);
        } else {
          return [childVal];
        }
      } else {
        return parentVal;
      }
    }

    LIFTCYCLE_HOOKS.forEach(hook => {
      strats[hook] = mergeHook;
    });
    function mergeOptions(parent, child) {
      const options = {};

      for (let key in parent) {
        mergeField(key);
      }

      for (let key in child) {
        // 如果已经合并了，就不需要再次合并、
        if (!parent.hasOwnProperty(key)) {
          mergeField(key);
        }
      } // mergeField是默认的合并策略，还有一些需要特殊处理，比如data、生命周期


      function mergeField(key) {
        // 如果有自己的合并策略，执行自己的合并策略，不会使用默认的合并策略
        if (strats[key]) {
          return options[key] = strats[key](parent[key], child[key]);
        }

        if (typeof parent[key] === "object" && typeof child[key] === "object") {
          options[key] = { ...parent[key],
            ...child[key]
          };
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

    let oldArrryMethods = Array.prototype;
    let arrayMethods = Object.create(oldArrryMethods);
    const methods = ["push", "pop", "unshift", "shift", "reverse", "sort", "splice"];
    methods.forEach(method => {
      arrayMethods[method] = function (...args) {
        // console.log("调用数组方法！");
        // console.log(args);
        // AOP 切片编程
        // （代理或者装饰器模式），先调用重写的方法，再调用原生方法
        let result = oldArrryMethods[method].apply(this, args); // 当 添加的属性还是对象时，要继续对新添加的属性进行劫持，添加get和set方法，变为响应式

        let inserted;
        let ob = this.__ob__;

        switch (method) {
          case "push":
          case "unshift":
            inserted = args;
            break;

          case "splice":
            inserted = args.slice(2);
            break;
        }

        if (inserted) {
          ob.observerArray(inserted);
        }

        ob.dep.notify();
        return result;
      };
    });

    let id$1 = 0;

    class Dep {
      constructor() {
        this.id = id$1++;
        this.subs = [];
        this.get();
      }

      get() {}

      addSub(watcher) {
        this.subs.push(watcher);
      }

      depend() {
        // this.subs.push(watcher);
        // 让当前的watcher记住我当前的dep（即属性，watcher订阅了哪个属性）
        if (Dep.target) {
          Dep.target.addDep(this);
        }
      }

      notify() {
        this.subs.forEach(watcher => watcher.update());
      }

    }

    let stack$1 = [];
    function pushTarget(watcher) {
      Dep.target = watcher;
      stack$1.push(watcher);
    }
    function popTarget() {
      stack$1.pop();
      Dep.target = stack$1[stack$1.length - 1];
    }

    class Observer {
      constructor(data) {
        // 此处的dep是给数组做依赖收集，派发更新用的
        this.dep = new Dep(); // console.log(data, "Observer类")
        // 给每一个监测的属性添加 __ob__ 属性
        // 1、可判断是否为响应式对象（是否已经被监测）
        // data.__ob__ = this;

        def(data, '__ob__', this);

        if (Array.isArray(data)) {
          // 需要重写能够改变数组自身的方法，如this.arr.push({name:'zs'}) ,给新添加的属性设置get和set方法
          data.__proto__ = arrayMethods; // 对数组进行监测
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

    function observe(data) {
      // console.log(data, "observe");
      // console.log(isObject(data));
      if (!isObject(data)) {
        return;
      }

      return new Observer(data); //用来观测对象
    } // 定义响应式数据，将数据变为可观测的响应式对象

    function defineReactive(data, key, value) {
      // <div>{{name}}{{name}}</div>
      // 此处为闭包，当渲染watcher执行getter的时候，会去触发name的getter
      // 如上,页面上两次使用name,但都是同一个dep实例,id相同
      let dep = new Dep(); // 这个dep是给对象用的
      // vue 数据层次过多，需要递归解析对象属性，一次添加set和get方法
      // 递归实现深度监测

      let childOb = observe(value); //这个value可能是数组，也可能是对象，返回的结果是Observer的实例

      Object.defineProperty(data, key, {
        get() {
          // 每个属性都对应着自己的watcher，即订阅者
          // 订阅了自己，setter的时候要去通知订阅者进行更新
          // 如果当前有wacher，需要将watcher和dep建立一个关系
          if (Dep.target) {
            dep.depend(); //意味着我要将watcher存起来
            // console.log("childOb是什么：",childOb);

            if (childOb) {
              childOb.dep.depend(); // 收集了数组的相关依赖
              // 如果数组中还有数组

              if (Array.isArray(value)) {
                dependArray(value);
              }
            }
          }

          return value;
        },

        set(newValue) {
          if (value === newValue) return;
          observe(newValue); //继续递归劫持用户设置的值，因为设置的值可能是一个对象，如 this.obj = {name:'zs'} => this.obj = {age: 20}

          value = newValue;
          dep.notify(); //通知依赖的watcher来进行更新
        }

      });
    }

    function dependArray(value) {
      for (let i = 0; i < value.length; i++) {
        let current = value[i]; // 数组中的数组进行依赖收集

        current.__ob__ && current.__ob__.dep.depend(); // 数组多层嵌套，内部还是数组，此时要递归

        if (Array.isArray(current)) {
          dependArray(current);
        }
      }
    }

    function initState(vm) {
      const options = vm.$options; // console.log(options);
      // vue 数据来源， 属性 方法 数据 计算属性  watch

      if (options.props) ;

      if (options.methods) ;

      if (options.data) {
        initData(vm);
      }

      if (options.computed) ;

      if (options.watch) ;
    }

    function initData(vm) {
      // 数据初始化工作
      let data = vm.$options.data;
      data = vm._data = typeof data === 'function' ? data.call(vm) : data; //做了一层代理，vm.name 代理到 vm._data.name 

      for (let key in data) {
        proxy(vm, "_data", key);
      } // console.log(data, "数据初始化工作")
      // 对象劫持，数据发生改变得到通知，刷新页面
      // Object.defineProperty() 给属性添加set和get方法，设置getter 和 setter


      observe(data);
    }

    // ast语法树，用对象来描述原生（html标签语法）语法的
    // 虚拟dom，用对象来描述dom节点的
    const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // const dynamicArgAttribute = /^\s*((?:v-[\w-]+:|@|:|#)\[[^=]+\][^\s"'<>\/=]*)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/

    const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`;
    const qnameCapture = `((?:${ncname}\\:)?${ncname})`;
    const startTagOpen = new RegExp(`^<${qnameCapture}`);
    const startTagClose = /^\s*(\/?)>/;
    const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`);
    let root = null; //根节点 

    let currentParent; //标识当前的父节点

    let stack = [];
    const ELEMENT_TYPE = 1; //元素类型，如div,p,span....

    const TEXT_TYPE = 3; //文本类型

    function createASTElement(tagName, attrs) {
      return {
        tagName: tagName,
        type: ELEMENT_TYPE,
        children: [],
        attrs: attrs,
        parent: null
      };
    }

    function start(tagName, attrs) {
      // console.log("开始标签：", tagName, "属性是：", attrs);
      // 遇到开始标签，就创建一个ast元素
      let element = createASTElement(tagName, attrs);

      if (!root) {
        root = element;
      }

      currentParent = element; //把当前元素标记为父ast树

      stack.push(element);
    }

    function charts(text) {
      // console.log("文本是：", text);
      text = text.replace(/\s/g, '');

      if (text) {
        currentParent.children.push({
          text,
          type: TEXT_TYPE
        });
      }
    }

    function end(tagName) {
      // console.log("结束标签：", tagName);
      let element = stack.pop();
      currentParent = stack[stack.length - 1];

      if (currentParent) {
        element.parent = currentParent;
        currentParent.children.push(element);
      }
    }

    function parseHTML(html) {
      // 循环解析html字符串
      while (html) {
        let textEnd = html.indexOf("<");

        if (textEnd === 0) {
          // 如果为0，肯定是第一个标签，且不是开始标签就是结束标签 
          // parseStartTag方法获取匹配的结果，tagName  attrs
          let startTagMatch = parseStartTag();

          if (startTagMatch) {
            start(startTagMatch.tagName, startTagMatch.attrs);
            continue; //如果开始标签匹配完毕后，继续下一次的匹配
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
        let start = html.match(startTagOpen); //匹配第一个标签名

        if (start) {
          const match = {
            tagName: start[1],
            attrs: []
          };
          advance(start[0].length); //将标签删除

          let end, attr; // while 匹配属性

          while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
            advance(attr[0].length); //将属性删除

            match.attrs.push({
              name: attr[1],
              value: attr[3] || attr[4] || attr[5]
            });
          }

          if (end) {
            advance(end[0].length); //标签名和属性已经匹配完成，去掉开始标签的>

            return match;
          } // console.log(match)

        } // console.log(html)

      }

      return root;
    } // html标签转换成ast语法树
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

    const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; // 处理属性，拼接成为属性的字符串

    function genProps(attrs) {
      let str = "";

      for (let i = 0; i < attrs.length; i++) {
        let attr = attrs[i];

        if (attr.name === "style") {
          let obj = {};
          attr.value.split(";").forEach(item => {
            let [key, value] = item.split(":");
            obj[key] = value;
          });
          attr.value = obj;
          str += `${attr.name}:${JSON.stringify(attr.value)},`;
        }
      }

      return `{${str.slice(0, -1)}}`;
    }

    function genChildren(el) {
      let children = el.children;

      if (children && children.length > 0) {
        return `${children.map(c => gen(c)).join(',')}`;
      } else {
        return false;
      }
    }

    function gen(node) {
      if (node.type === 1) {
        // 元素标签
        return generate(node);
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

        return `_v(${tokens.join('+')})`;
      }
    }

    function generate(el) {
      let children = genChildren(el);
      let code = `_c("${el.tagName}",${el.attrs.length > 0 ? genProps(el.attrs) : 'undefined'}${children ? `,${children}` : ''})`;
      return code;
    }

    function compileToFunction(template) {
      // console.log(template, 'template 转换 render方法');
      // 1、解析html字符串，将html字符串解析成ast语法树
      let root = parseHTML(template); // console.log(root);
      // 2、需要将ast语法树生成最终的render函数,就是字符串拼接（模板引擎）
      // 核心思路就是将下面的模板转化成下面的字符串
      // 模板： <div id="app"><p>hello {{name}}</p> hello</div>
      // 将html字符串转化成ast语法树，再将ast语法树，再次转化成下面的js语法
      // 字符串： _c("div",{id:app},_c("p",undefined,_v("hello" + _s(name))),_v("hello"))

      let code = generate(root); // console.log(code);
      //所有的模板引擎实现，都需要new Function + with

      let renderFn = new Function(`with(this){return ${code}}`); // renderFn = function render() { }
      // vue的render方法返回的是虚拟dom

      return renderFn; //render函数
    }

    let callBacks = [];
    let waiting = false;

    function flusCallback() {
      callBacks.forEach(cb => cb());
      waiting = false;
      callBacks = [];
    }

    function nextTick(cb) {
      callBacks.push(cb); // waiting的作用：
      // 同一个tick同步代码还没执行完成，不会让它重复添加setTimeout

      if (waiting === false) {
        setTimeout(flusCallback, 0);
        waiting = true;
      }
    }

    let queue = [];
    let has = {};

    function flushSchedularQue() {
      queue.forEach(watcher => watcher.run());
      queue = [];
      has = {};
    }

    function queueWatcher(watcher) {
      let id = watcher.id;

      if (has[id] == null) {
        queue.push(watcher);
        has[id] = true; // 宏任务和微任务，，vue里面使用了vue.nextTick来实现
        // vue.nextTick 优雅降级处理
        // 1、promise 2、mutationObserver 3、setImmediate 4、setTimeout
        // setTimeout(flushSchedularQue, 0);

        nextTick(flushSchedularQue);
      }
    }

    let id = 0;

    class Watcher {
      constructor(vm, exprOrFn, callback, options) {
        this.vm = vm;
        this.callback = callback;
        this.options = options;
        this.id = id++;
        this.deps = [];
        this.depsId = new Set(); // 将内部传进来的回调方法放在getter属性上

        this.getter = exprOrFn; // 调用get方法，会让渲染watcher执行

        this.get();
      }

      get() {
        // 把当前的watcher存起来，存在dep里面
        pushTarget(this); // 渲染watcher的执行，此时会调用vm_update(vm._render),
        // 此时会去取值，会触发属性的getter

        this.getter(); // 移除watcher

        popTarget();
      }

      addDep(dep) {
        // watcher里面不能存放重复的dep，dep里面也不能存放重复的watcher
        let id = dep.id;

        if (!this.depsId.has(id)) {
          this.depsId.add(id);
          this.deps.push(dep);
          dep.addSub(this);
        }
      }

      update() {
        // this.get();
        // 异步更新，等同步任务执行完成之后，再去执行更新
        // 此时还是同步，通过nextTick来变成异步任务，放到下一个tick去执行
        queueWatcher(this);
      }

      run() {
        this.get();
      }

    }

    function patch(oldVnode, vnode) {
      // console.log("开始patch，虚拟节点vnode创建出真实的节点，替换掉真实的vm.$el");
      // console.log(oldVnode);
      // console.log(vnode);
      // console.log(oldVnode.nodeType);
      // 递归创建真实节点，替换掉老节点
      // 第一步：判断是更新还是渲染
      // 虚拟节点里面没有nodeType，真实节点里面有
      const isRealEmement = oldVnode.nodeType;
      let el; // 第一次渲染 oldVnode是当前的 div id="app"
      // 以后更新 oldVnode 是上一次的dom

      if (isRealEmement) {
        const oldElm = oldVnode; //当前的 div id="app"

        const parentElm = oldElm.parentNode; //body
        // vnode创建成真实dom

        el = createElm(vnode); // createElm(vnode)创建的新的真实dom插入到老节点的后面

        parentElm.insertBefore(el, oldElm.nextSibling); // 然后删除老节点,这样就完成了替换

        parentElm.removeChild(oldElm);
      } // console.log(el);


      return el;
    }

    function createElm(vnode) {
      //根据虚拟节点创建真实的节点
      // console.log(vnode, "根据虚拟节点创建真实的节点");
      let {
        tag,
        children,
        key,
        data,
        text
      } = vnode; // tag为标签，就创建标签，否则就是文本并创建

      if (typeof tag === "string") {
        vnode.el = document.createElement(tag);
        updateProperties(vnode); //递归创建子节点，并将子节点添加到父节点上面 

        children.forEach(child => {
          return vnode.el.appendChild(createElm(child));
        });
      } else {
        // 创建的真实节点放在vnode上面，
        // 虚拟dom上映射着真实的dom，方便后续更新操作
        vnode.el = document.createTextNode(text);
      }

      return vnode.el;
    } // 更新属性


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

    function lifecycleMixin(Vue) {
      Vue.prototype._update = function (vnode) {
        // console.log(vnode);
        let vm = this; // console.log(vm.$el);
        // 此时虚拟dom已经生成，通过虚拟dom vnode，去渲染出真实的dom
        // 需要用虚拟节点vnode创建出真实的节点，替换掉真实的vm.$el

        vm.$el = patch(vm.$el, vnode);
      };
    }
    function mountComponent(vm, el) {
      vm.$options;
      vm.$el = el; //真是的dom元素
      // console.log(options)

      callHook(vm, "beforeMount"); // 渲染页面
      // 无论是渲染还是更新都会调用updateComponent函数 

      let updateComponent = () => {
        // 第一步：调用vm._render生成虚拟dom，vm._render调用的是options.render
        // vm._render为vue原型上的一个方法，见render.js
        // 在 调用mountComponent函数之前已经将创建的render方法挂载到了options上面
        // 第二步：vm._update 将虚拟dom生成真实的dom
        console.log("更新了几次");

        vm._update(vm._render());
      }; // 渲染watcher，每个组件都有一个渲染watcher
      // true 表示是一个渲染watcher
      // 每次new一个实例对象的时候，都会起执行updateComponent方法


      new Watcher(vm, updateComponent, () => {}, true);
      callHook(vm, "mounted");
    } // 发布的过程

    function callHook(vm, hook) {
      let handlers = vm.$options[hook];

      if (handlers) {
        for (let i = 0; i < handlers.length; i++) {
          // call(vm) 保证用户在使用声明周期的时候，内部的this指向的是vue实例
          handlers[i].call(vm);
        }
      }
    }

    function initMixin(Vue) {
      Vue.prototype._init = function (options) {
        // console.log(options)
        // 数据的劫持
        const vm = this; // vue中this.$options 指代的就是用户定义的属性
        // vm.$options = options;
        // 用户传入的options和Vue.options合并到vm.$options上，即实例的$options上面
        // options指代的就是用户定义的属性
        // vm.constructor.options 有些实例是继承而来，所以始终要指向实例自身的options
        // 将用户传递的 和 全局的 进行合并

        console.log(vm.constructor.options);
        vm.$options = mergeOptions(vm.constructor.options, options);
        console.log(vm.$options);
        callHook(vm, "beforeCreate"); // 初始化状态

        initState(vm);
        callHook(vm, "created"); // 用户传入 el 需要将数据渲染到页面上,实现挂载流程
        // 模板有三种方式 render template el
        // 有个顺序优先级的 render最高 

        if (vm.$options.el) {
          // console.log(vm.$options.el);
          vm.$mount(vm.$options.el);
        }
      };

      Vue.prototype.$mount = function (el) {
        let vm = this;
        let options = vm.$options;
        el = document.querySelector(el); // console.log(el)
        // 优先级，默认查找有没有render方法，没有render会去查找有没有template，
        // 没有template 会去使用 el 中的内容

        if (!options.render) {
          let template = options.template; //取出模板，如果有对模板进行编译

          if (!template && el) {
            // 没有模板，且有 el ，将el赋值给template
            template = el.outerHTML;
          } // 将template转化成render函数


          const render = compileToFunction(template);
          options.render = render;
        } // 拿到render方法之后，开始渲染当前的组件
        // vm上面可以拿到options render方法，执行render方法之后的结果替换掉 el这个标签


        mountComponent(vm, el);
      }; // 注册$nextTick，给用户使用


      Vue.prototype.$nextTick = nextTick;
    }

    function createElement(tag, data = {}, ...children) {
      // console.log(tag, data, children);
      let key = data.key;

      if (key) {
        delete data.key;
      }

      return vnode(tag, data, key, children, undefined);
    }
    function createTextNode(text) {
      // console.log(text);
      return vnode(undefined, undefined, undefined, undefined, text);
    } // 创建虚拟dom

    function vnode(tag, data, key, children, text) {
      return {
        tag,
        data,
        key,
        children,
        text
      };
    } // 1、将template模板（html标签）转换成ast语法树 => 生成render方法  => 生成虚拟dom => 真实的dom
    // 2、更新的时候重新生成虚拟dom，和上次的虚拟dom作对比，只把改变的虚拟dom重新生成真实的dom

    function renderMixin(Vue) {
      // 
      // _c 创建元素的虚拟节点
      // _v 创建文本的虚拟节点
      // _s JSON，stringify
      // 使用了 with ，render.call(vm)，调用_c,_v,_s方法时，会去vm以及vm的原型上面去找这些方法
      // 巧妙的一点是，_s(val)函数执行时，传入的val即为模板中设置的属性{{name}}，因为with(this){},
      // 此时的上下文为this，即为传入的vm，即是执行vm.name，之前已做过proxy()代理，vm.name => vm._data.name
      Vue.prototype._c = function () {
        return createElement(...arguments);
      };

      Vue.prototype._v = function (text) {
        return createTextNode(text);
      };

      Vue.prototype._s = function (val) {
        return val === null ? '' : typeof val === 'object' ? JSON.stringify(val) : val;
      };

      Vue.prototype._render = function () {
        // console.log("render-----");
        const vm = this;
        let {
          render
        } = vm.$options;
        let vnode = render.call(vm);
        return vnode;
      };
    }

    function initGlobalAPI(Vue) {
      // 整合了所有的全局相关的内容
      Vue.options = {}; // 生命周期的合并策略,同名的生命周期会合并成一个数组 [beforeCreate,beforeCreate]
      // 依次执行，不会覆盖，，其实是一个发布订阅模式

      Vue.mixin = function (mixin) {
        // 面试经常问，如何实现两个对象的合并
        this.options = mergeOptions(this.options, mixin);
      };

      console.log(Vue.options);
    }

    function Vue(options) {
      // 进行vue的初始化操作
      this._init(options); // console.log(options, "进行vue的初始化操作");

    }

    initMixin(Vue); //初始化的函数，在vue原型上面添加_init方法

    renderMixin(Vue); //_render函数，在vue原型上面添加_render方法

    lifecycleMixin(Vue); //_update函数，在vue原型上面添加_update方法
    // 初始化全局方法，构造函数静态方法 ，例如Vue.mixin

    initGlobalAPI(Vue);

    return Vue;

})));
//# sourceMappingURL=vue.js.map
