(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
}(this, (function () { 'use strict';

  function _typeof(obj) {
    "@babel/helpers - typeof";

    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArrayLimit(arr, i) {
    if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return;
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  // 判断是否是一个对象{}
  function isObject(obj) {
    return _typeof(obj) === "object" && obj !== null;
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
      get: function get() {
        return vm[source][key];
      },
      set: function set(newValue) {
        vm[source][key] = newValue;
      }
    });
  }

  var oldArrryMethods = Array.prototype;
  var arrayMethods = Object.create(oldArrryMethods);
  var methods = ["push", "pop", "unshift", "shift", "reverse", "sort", "splice"];
  methods.forEach(function (method) {
    arrayMethods[method] = function () {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      // console.log("调用数组方法！");
      // console.log(args);
      // AOP 切片编程
      // （代理或者装饰器模式），先调用重写的方法，再调用原生方法
      var result = oldArrryMethods[method].apply(this, args); // 当 添加的属性还是对象时，要继续对新添加的属性进行劫持，添加get和set方法，变为响应式

      var inserted;
      var ob = this.__ob__;

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

      return result;
    };
  });

  var Observer = /*#__PURE__*/function () {
    function Observer(data) {
      _classCallCheck(this, Observer);

      // console.log(data, "Observer类")
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

    _createClass(Observer, [{
      key: "observerArray",
      value: function observerArray(data) {
        for (var i = 0; i < data.length; i++) {
          observe(data[i]);
        }
      }
    }, {
      key: "walk",
      value: function walk(data) {
        var keys = Object.keys(data);

        for (var i = 0; i < keys.length; i++) {
          var key = keys[i];
          var value = data[key];
          defineReactive(data, key, value);
        }
      }
    }]);

    return Observer;
  }();

  function observe(data) {
    // console.log(data, "observe");
    // console.log(isObject(data));
    if (!isObject(data)) {
      return;
    }

    return new Observer(data); //用来观测对象
  } // 定义响应式数据，将数据变为可观测的响应式对象

  function defineReactive(data, key, value) {
    // vue 数据层次过多，需要递归解析对象属性，一次添加set和get方法
    // 递归实现深度监测
    observe(value);
    Object.defineProperty(data, key, {
      get: function get() {
        return value;
      },
      set: function set(newValue) {
        if (value === newValue) return;
        observe(newValue); //继续递归劫持用户设置的值，因为设置的值可能是一个对象，如 this.obj = {name:'zs'} => this.obj = {age: 20}

        value = newValue;
      }
    });
  }

  function initState(vm) {
    var options = vm.$options; // console.log(options);
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
    var data = vm.$options.data;
    data = vm._data = typeof data === 'function' ? data.call(vm) : data; //做了一层代理，vm.name 代理到 vm._data.name 

    for (var key in data) {
      proxy(vm, "_data", key);
    } // console.log(data, "数据初始化工作")
    // 对象劫持，数据发生改变得到通知，刷新页面
    // Object.defineProperty() 给属性添加set和get方法，设置getter 和 setter


    observe(data);
  }

  // ast语法树，用对象来描述原生（html标签语法）语法的
  // 虚拟dom，用对象来描述dom节点的
  var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // const dynamicArgAttribute = /^\s*((?:v-[\w-]+:|@|:|#)\[[^=]+\][^\s"'<>\/=]*)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/

  var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z]*";
  var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")");
  var startTagOpen = new RegExp("^<".concat(qnameCapture));
  var startTagClose = /^\s*(\/?)>/;
  var endTag = new RegExp("^<\\/".concat(qnameCapture, "[^>]*>"));
  var root = null; //根节点 

  var currentParent; //标识当前的父节点

  var stack = [];
  var ELEMENT_TYPE = 1; //元素类型，如div,p,span....

  var TEXT_TYPE = 3; //文本类型

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
    console.log("开始标签：", tagName, "属性是：", attrs); // 遇到开始标签，就创建一个ast元素

    var element = createASTElement(tagName, attrs);

    if (!root) {
      root = element;
    }

    currentParent = element; //把当前元素标记为父ast树

    stack.push(element);
  }

  function charts(text) {
    console.log("文本是：", text);
    text = text.replace(/\s/g, '');

    if (text) {
      currentParent.children.push({
        text: text,
        type: TEXT_TYPE
      });
    }
  }

  function end(tagName) {
    console.log("结束标签：", tagName);
    var element = stack.pop();
    currentParent = stack[stack.length - 1];

    if (currentParent) {
      element.parent = currentParent;
      currentParent.children.push(element);
    }
  }

  function parseHTML(html) {
    // 循环解析html字符串
    while (html) {
      var textEnd = html.indexOf("<");

      if (textEnd === 0) {
        // 如果为0，肯定是第一个标签，且不是开始标签就是结束标签 
        // parseStartTag方法获取匹配的结果，tagName  attrs
        var startTagMatch = parseStartTag();

        if (startTagMatch) {
          start(startTagMatch.tagName, startTagMatch.attrs);
          continue; //如果开始标签匹配完毕后，继续下一次的匹配
        }

        var endTagMatch = html.match(endTag);

        if (endTagMatch) {
          advance(endTagMatch[0].length);
          end(endTagMatch[1]);
          continue;
        }
      }

      var text = void 0;

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
      var start = html.match(startTagOpen); //匹配第一个标签名

      if (start) {
        var match = {
          tagName: start[1],
          attrs: []
        };
        advance(start[0].length); //将标签删除

        var _end, attr; // while 匹配属性


        while (!(_end = html.match(startTagClose)) && (attr = html.match(attribute))) {
          advance(attr[0].length); //将属性删除

          match.attrs.push({
            name: attr[1],
            value: attr[3] || attr[4] || attr[5]
          });
        }

        if (_end) {
          advance(_end[0].length); //标签名和属性已经匹配完成，去掉开始标签的>

          return match;
        }

        console.log(match);
      }

      console.log(html);
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

  var defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; // 处理属性，拼接成为属性的字符串

  function genProps(attrs) {
    var str = "";

    for (var i = 0; i < attrs.length; i++) {
      var attr = attrs[i];

      if (attr.name === "style") {
        (function () {
          var obj = {};
          attr.value.split(";").forEach(function (item) {
            var _item$split = item.split(":"),
                _item$split2 = _slicedToArray(_item$split, 2),
                key = _item$split2[0],
                value = _item$split2[1];

            obj[key] = value;
          });
          attr.value = obj;
          str += "".concat(attr.name, ":").concat(JSON.stringify(attr.value), ",");
        })();
      }
    }

    return "{".concat(str.slice(0, -1), "}");
  }

  function genChildren(el) {
    var children = el.children;

    if (children && children.length > 0) {
      return "".concat(children.map(function (c) {
        return gen(c);
      }).join(','));
    } else {
      return false;
    }
  }

  function gen(node) {
    if (node.type === 1) {
      // 元素标签
      return generate(node);
    } else {
      var text = node.text;
      var tokens = [];
      var match, index;
      var lastIndex = defaultTagRE.lastIndex = 0;

      while (match = defaultTagRE.exec(text)) {
        index = match.index;

        if (index > lastIndex) {
          tokens.push(JSON.stringify(text.slice(lastIndex, index)));
        }

        tokens.push("_s(".concat(match[1].trim(), ")"));
        lastIndex = index + match[0].length;
      }

      if (lastIndex < text.length) {
        tokens.push(JSON.stringify(text.slice(lastIndex)));
      }

      return "_v(".concat(tokens.join('+'), ")");
    }
  }

  function generate(el) {
    var children = genChildren(el);
    var code = "_c(\"".concat(el.tagName, "\",").concat(el.attrs.length > 0 ? genProps(el.attrs) : 'undefined').concat(children ? ",".concat(children) : '', ")");
    return code;
  }

  function compileToFunction(template) {
    console.log(template, 'template 转换 render方法'); // 1、解析html字符串，将html字符串解析成ast语法树

    var root = parseHTML(template);
    console.log(root); // 2、需要将ast语法树生成最终的render函数,就是字符串拼接（模板引擎）
    // 核心思路就是将下面的模板转化成下面的字符串
    // 模板： <div id="app"><p>hello {{name}}</p> hello</div>
    // 将html字符串转化成ast语法树，再将ast语法树，再次转化成下面的js语法
    // 字符串： _c("div",{id:app},_c("p",undefined,_v("hello" + _s(name))),_v("hello"))

    var code = generate(root);
    console.log(code); //所有的模板引擎实现，都需要new Function + with

    var renderFn = new Function("with(this){return ".concat(code, "}")); // renderFn = function render() { }
    // vue的render方法返回的是虚拟dom

    return renderFn; //render函数
  }

  var Watcher = /*#__PURE__*/function () {
    function Watcher(vm, exprOrFn, callback, options) {
      _classCallCheck(this, Watcher);

      this.vm = vm;
      this.callback = callback;
      this.options = options; // 将内部传进来的回调方法放在getter属性上

      this.getter = exprOrFn;
      this.get();
    }

    _createClass(Watcher, [{
      key: "get",
      value: function get() {
        this.getter();
      }
    }]);

    return Watcher;
  }();

  function patch(oldVnode, vnode) {
    console.log("开始patch，虚拟节点vnode创建出真实的节点，替换掉真实的vm.$el");
    console.log(oldVnode, vnode); // 递归创建真实节点，替换掉老节点
    // 第一步：判断是更新还是渲染
    // 虚拟节点里面没有nodeType，真实节点里面有

    var isRealEmement = oldVnode.nodeType;

    if (isRealEmement) {
      var oldElm = oldVnode; //当前的 div id="app"

      var parentElm = oldElm.parentNode; //body
      // vnode创建成真实dom

      var el = createElm(vnode); // createElm(vnode)创建的新的真实dom插入到老节点的后面

      parentElm.insertBefore(el, oldElm.nextSibling); // 然后删除老节点,这样就完成了替换

      parentElm.removeChild(oldElm);
    }
  }

  function createElm(vnode) {
    //根据虚拟节点创建真实的节点
    console.log(vnode, "根据虚拟节点创建真实的节点");
    var tag = vnode.tag,
        children = vnode.children;
        vnode.key;
        vnode.data;
        var text = vnode.text; // tag为标签，就创建标签，否则就是文本并创建

    if (typeof tag === "string") {
      vnode.el = document.createElement(tag);
      updateProperties(vnode); //递归创建子节点，并将子节点添加到父节点上面 

      children.forEach(function (child) {
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
    var newProps = vnode.data;
    var el = vnode.el;

    for (var key in newProps) {
      if (key === "style") {
        for (var styleName in newProps.style) {
          el.style[styleName] = newProps.style[styleName];
        }
      } else if (key === "class") {
        el.className = newProps["class"];
      } else {
        el.setAttribute(key, newProps[key]);
      }
    }
  }

  function lifecycleMixin(Vue) {
    Vue.prototype._update = function (vnode) {
      console.log(vnode);
      var vm = this; // 此时虚拟dom已经生成，通过虚拟dom vnode，去渲染出真实的dom
      // 需要用虚拟节点vnode创建出真实的节点，替换掉真实的vm.$el

      vm.$el = patch(vm.$el, vnode);
    };
  }
  function mountComponent(vm, el) {
    var options = vm.$options;
    vm.$el = el; //真是的dom元素

    console.log(options); // 渲染页面
    // 无论是渲染还是更新都会调用updateComponent函数 

    var updateComponent = function updateComponent() {
      // 第一步：调用vm._render生成虚拟dom，vm._render调用的是options.render
      // vm._render为vue原型上的一个方法，见render.js
      // 在 调用mountComponent函数之前已经将创建的render方法挂载到了options上面
      // 第二步：vm._update 将虚拟dom生成真实的dom
      vm._update(vm._render());
    }; // 渲染watcher，每个组件都有一个渲染watcher
    // true 表示是一个渲染watcher
    // 每次new一个实例对象的时候，都会起执行updateComponent方法


    new Watcher(vm, updateComponent, function () {}, true);
  }

  function initMixin(Vue) {
    Vue.prototype._init = function (options) {
      console.log(options); // 数据的劫持

      var vm = this; // vue中this.$options 指代的就是用户定义的属性

      vm.$options = options; // 初始化状态

      initState(vm); // 用户传入 el 需要将数据渲染到页面上,实现挂载流程
      // 模板有三种方式 render template el
      // 有个顺序优先级的 render最高 

      if (vm.$options.el) {
        console.log(vm.$options.el);
        vm.$mount(vm.$options.el);
      }
    };

    Vue.prototype.$mount = function (el) {
      var vm = this;
      var options = vm.$options;
      el = document.querySelector(el);
      console.log(el); // 优先级，默认查找有没有render方法，没有render会去查找有没有template，
      // 没有template 会去使用 el 中的内容

      if (!options.render) {
        var template = options.template; //取出模板，如果有对模板进行编译

        if (!template && el) {
          // 没有模板，且有 el ，将el赋值给template
          template = el.outerHTML;
        } // 将template转化成render函数


        var render = compileToFunction(template);
        options.render = render;
      } // 拿到render方法之后，开始渲染当前的组件
      // vm上面可以拿到options render方法，执行render方法之后的结果替换掉 el这个标签


      mountComponent(vm, el);
    };
  }

  function createElement(tag) {
    var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    // console.log(tag, data, children);
    var key = data.key;

    if (key) {
      delete data.key;
    }

    for (var _len = arguments.length, children = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      children[_key - 2] = arguments[_key];
    }

    return vnode(tag, data, key, children, undefined);
  }
  function createTextNode(text) {
    // console.log(text);
    return vnode(undefined, undefined, undefined, undefined, text);
  } // 创建虚拟dom

  function vnode(tag, data, key, children, text) {
    return {
      tag: tag,
      data: data,
      key: key,
      children: children,
      text: text
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
      return createElement.apply(void 0, arguments);
    };

    Vue.prototype._v = function (text) {
      return createTextNode(text);
    };

    Vue.prototype._s = function (val) {
      return val === null ? '' : _typeof(val) === 'object' ? JSON.stringify(val) : val;
    };

    Vue.prototype._render = function () {
      console.log("render-----");
      var vm = this;
      var render = vm.$options.render;
      var vnode = render.call(vm);
      return vnode;
    };
  }

  function Vue(options) {
    // 进行vue的初始化操作
    this._init(options); // console.log(options, "进行vue的初始化操作");

  }

  initMixin(Vue); //初始化的函数，在vue原型上面添加_init方法

  renderMixin(Vue); //_render函数，在vue原型上面添加_render方法

  lifecycleMixin(Vue); //_update函数，在vue原型上面添加_update方法

  return Vue;

})));
//# sourceMappingURL=vue.js.map
