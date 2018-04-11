# 介绍

monitor-js 是一个轻量级前端错误监控插件
# 优点

1. 能够获取客户端浏览器环境
    
2. 支持amd 

3. 记录用户操作

4. 自定义项目

5. 自定义过滤错误信息

6. 可选择错误等级

7. 自定义上报域名

8. 插件形式加载，可扩展性高，轻松自定义扩展

> 

# 如何获取

通过以下方式都可以下载：

执行`npm i monitor-js`

# 如何使用

## 浏览器引入:

```html

    直接引入
    <script src="monitor-js/lib/monitor.js"></script>
    插件引入
    <script src="monitor-js/lib/vuePlugin.js"></script>

```
## 模块引入:

```js

    import Monitor from "monitor-js/lib/monitor.js"
    import vuePlugin from "monitor-js/lib/vuePlugin.js"
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

# 参考链接

    https://github.com/joyqi/mobile-device-js
