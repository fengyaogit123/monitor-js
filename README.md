# 介绍

monitors-js 是一个轻量级前端错误监控插件
# 优点

1. 能够获取客户端浏览器环境
    
2. 支持amd 

3. 记录用户操作

4. 自定义项目

5. 自定义过滤错误信息

6. 可选择错误等级

7. 自定义上报域名

8. 插件形式加载，可扩展性高，轻松自定义扩展

9. 业务埋点，自定义埋点信息
> 

# 如何获取

通过以下方式都可以下载：

执行`npm i monitors-js`

# 如何使用

## 浏览器引入:

```html


    直接引入
    <script src="monitors-js/lib/monitor.js"></script>
    插件引入
    <script src="monitors-js/lib/vuePlugin.js"></script>

```

```html

    统计标签点击率
    <Button action = '{ "type":"adButton","name":"广告位点击" }'>广告位图片</Button>

```
    1.设置了action属性的标签，被点击后会触发onPointClick 回调，并且序列化后传入参数
    2.action格式是JSON字符串( 属性名用"type":"" )
    3.可以自定义属性名称 通过 monitor.setAttrName(" data-ac ")
```html
    <img data-ac='{ "type":"adButton","name":"广告位点击" }' src="">
```
    4.有些时候，html，body之类的标签被click，我们不需要记录，我们通过  filterTag 过滤 默认过滤了html,body 标签

```js
    //默认
    new Monitor({
        filterTag:function(tag){
            //自定义标签过滤选项
            return ['body', 'html','button'].indexOf(tag) === -1
        }
    })
```
    5.action 属性可以自定义扩展参数，如user 等参数如  action='{"type":"acButton","user":"xxxx"}'

```js
    ...
    .on('onPointClick',(data)=>{
            console.log(data.user)//xxxx
    })

```
    注意 action 属性是纯字符串属性，在vue中使用也是使用字符串，不能使用对象！
## 模块引入:

```js

    import Monitor from "monitors-js/lib/monitor.js"
    import vuePlugin from "monitors-js/lib/vuePlugin.js"
    var monitor = new Monitor({
        itemID: 'asdjasdtjk21b3k1j2g3',//唯一的项目Id
        url: '',//若autoPush为true 则自动上报异常 ，跨域需要配置
        autoPush: true,// 是否自动上报异常 ，默认为false
        match: ["localhost"],//需要上报的域名 开发环境下可以不选择上报
        exclude: ['WeixinJSBridge', 'x5onSkinSwitch'],//过滤的错误信息 根据details字段
    })
    //需要最先声明
    monitor
        .addPlugin(vuePlugin)//添加vueError监听 根据errorHandler函数
        .install()
        .on('captureBefore', (data) => {
            //上报异常触发的回调 data 是上报的参数
            console.log(data)
        })
        .on('onPointClick',(data)=>{
            // action = '{ "type":"adButton",name:"广告位点击" }'
            console.log(data.value)
            console.log(data)
        })
    //设置
    monitor.setConfig({
        email:"xx@qq.com",
        userName:"张三"
    })    
    new Vue({
        el: "#id",
        created: function () {
            console.log('c')
            1 / x
        },
        render: function (h) {
            return h('Button', 'click')
        }
    })
```
## API:
    new Monitor(config)

    | Monitor构造函数 | 说明                                         | 类型          | 默认值|
    |----------------|----------------------------------------------|---------------|------|
    | itemID         | 唯一项目Id                                    | string        | " "  |
    | url            | 若autoPush为true 则自动上报异常 ,跨域需要配置   | string        | " "  |
    | autoPush       | 若autoPush为true 则自动上报异常 ,跨域需要配置   | boolean       | true |
    | match          | 需要上报的域名 ,开发环境下可以不选择上报         | Array<String> | []   |
    | exclude        | 过滤的错误信息 ,根据details字段                 | Array<String> | []   |

    可自定义扩展参数

    | 实例方法                           | 说明                     |      
    |-----------------------------------|--------------------------|
    | addPlugin(function)               | 添加插件                  |     
    | install()                         | 安装插件                  |      
    | on(type:string,callback:function) | 监听事件，captureBefore   |  
    | setConfig()                       | 修改配置                  |   
    | pushException(op:object)          | 上传异常                  |   

    监听事件

    |监听事件type    | 说明       | 类型 | 
    |---------------|------------|-----|
    | onInstall     | 安装完成回调|     |
    | onPointClick  | action回调 |     |
    | captureBefore | 上传之前回调|     |   

## 扩展插件
```js
    
    比如vue框架的扩展插件

    export default function vuePlugin() {
        const origin = Vue.config.errorHandler||function(){}
        Vue.config.errorHandler = (error, vm, info) => {
            let details = error.toString();
            let route = ''
            if (vm.$route && vm.$route.meta && vm.$route.meta.title) {
                route = vm.$route.meta.title
            } else if (vm.$route) {
                route = vm.$route.path
            }
            let data = {
                route: route,
                details: details + '   ' + info,
                errorDetails: error.stack,
            }
            this.pushException(data)//调用此方法提交异常

            origin(arguments)
        }
    }
    window.vuePlugin = vuePlugin


```

## 提交数据格式

```js

    {
        browserName:Chrome
        phoneSystemType:
        phoneSystemVer:
        phoneName:
        reportTime:
        url:
        itemID:
        email:
        user:
        actions:[]
        route:
        details:
        errorDetails:
    }

```
