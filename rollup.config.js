import babel from "@rollup/plugin-babel"
import serve from "rollup-plugin-serve"

export default {
    input: "./src/index.js",//打包入口文件
    output: {
        file: "dist/umd/vue.js",//打包出口路径
        name: "Vue",//指定打包后全局变量名称
        format: "umd",//指定模块规范
        sourcemap: true//源码console（es6=>es5，查看es6日志，开启源码调试，可以找的源码的报错位置）
    },
    plugins: [
        babel({
            exclude: "node_modules/**"
        }),
        process.env.ENV === "development" ?
            serve({
                open: true,
                openPage: "/public/index.html",
                prot: 3030,
                contentBase: ""
            }) : null
    ]
}