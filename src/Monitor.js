'use strict'
import QS from 'querystring'
import EventEmitter from './EmitEvent.js'
import Device from 'browser-device-js'

export default class Monitor extends EventEmitter {
    constructor(params = {}) {
        super()
        let { exclude = [], match = [], url, filterTag, autoPush = true, ...prop } = params;
        this.config = prop;
        this.exclude = exclude;
        this.match = match;
        this.url = url;
        this.autoPush = autoPush;
        this.plugins = [];
        this.filterTag = filterTag;
        this.attrName = "action"
    }
    initEvent() {
        this.windowError();
        this.domEvent();
    }
    setConfig(config = {}) {
        this.config = { ...this.config, ...config }
        return this
    }
    addPlugin(func) {
        this.plugins.push(func)
        return this;
    }
    captureException(data, callback) {
        let img = document.createElement('img');
        let params = QS.stringify({
            ...data,
            actions: JSON.stringify(data.actions)
        })

        img.src = `${this.url}?_t=${+new Date()}${params}`
        img.style.display = "none"

        document.body.appendChild(img);
        img.parentNode.removeChild(img);
    }
    getCurrInfo() {
        if (!this.device)
            this.device = new Device().getDevice();
        return {
            ...this.device,
            reportTime: this.dateFormat(new Date(), "yyyy-MM-dd hh:mm:sss"),
            url: window.location.href,
            ...this.config
        }
    }
    dateFormat(date, fmt) {
        var o = {
            "M+": date.getMonth() + 1, //月份
            "d+": date.getDate(), //日
            "H+": date.getHours(), //小时
            "h+": date.getHours(), //小时
            "m+": date.getMinutes(), //分
            "s+": date.getSeconds(), //秒
            "q+": Math.floor((date.getMonth() + 3) / 3), //季度
            "S": date.getMilliseconds() //毫秒
        };
        if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
            if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    }
    install() {
        let i = 0;
        while (i < this.plugins.length) {
            this.plugins[i].call(this)
            i++;
        }
        this.initEvent();

        this.emit('onInstall')
        return this
    }
    pushException(obj = {}) {
        if (this.isDomainfilter()) return
        if (this.isErrorfilter(obj.details)) return;
        let data = {
            ...this.getCurrInfo(),
            actions: this.getStorageAction(),
            ...obj,
        }
        delete data.browserVer
        this.emit('captureBefore', data)
        if (!this.autoPush) {
            return
        }
        setTimeout(() => {
            this.captureException(data)
        }, 0);
    }
    isErrorfilter(msg) {
        return this.exclude.filter((ex) => {
            return msg.indexOf(ex) !== -1
        }).length > 0 ? true : false;
    }
    isDomainfilter() {
        let href = window.location.href;
        return this.match.filter((ex) => {
            return href.indexOf(ex) !== -1
        }).length >= 0 ? false : true;
    }
    windowError() {
        window.onerror = (msg, url, line, col, error) => {
            let details = `${msg}  line：${line}`;

            this.pushException({
                route: url,
                details,
                errorDetails: error && error.stack,
            })
        }
    }
    getStorageAction() {
        let _actions = sessionStorage.getItem('_actions');
        if (!_actions) return [];
        try {
            return JSON.parse(_actions) || [];
        } catch (e) {
            return [];
        }
    }
    setStorageAction(_actions) {
        let MAX = 8;
        if (typeof _actions === 'string') {
            sessionStorage.setItem('_actions', _actions);
            return
        }
        if (_actions instanceof Array && _actions.length > MAX) {
            _actions.shift();
        }
        try {
            sessionStorage.setItem('_actions', JSON.stringify(_actions));
        } catch (e) {

        }
    }
    domEvent() {
        window.addEventListener('click', (e) => {
            e = e || window.event;
            let _actions = this.getStorageAction();
            let currHtml = this.getCurrHtml(e);
            if (!currHtml) return

            _actions.push({
                type: e.type,
                target: currHtml,
                time: this.dateFormat(new Date(), "yyyy-MM-dd hh:mm:sss")
            })

            this.setStorageAction(_actions)
        });
    }
    getCurrHtml(e) {
        const target = e.srcElement ? e.srcElement : e.target;
        let { localName, id, className, innerText = '' } = target;

        const filterTag = this.filterTag || function (tag) {
            return ['body', 'html'].indexOf(tag) === -1
        }
        if (!filterTag(localName)) return ''

        let action = target.getAttribute(this.attrName)
        if (action && (action.indexOf("{") !== -1 && action.indexOf("}") !== -1)) {
            try {
                let point = JSON.parse(action)
                this.emit('onPointClick', point)
            } catch (e) {
                this.emit('onPointClick', {
                    value: action
                })
            }
        }
        innerText = innerText.replace(/\s/g, '').substring(0, 20);

        id = id && `id="${id}"` || '';
        className = className && `className="${className}"` || '';
        action = action && `action="${action}"` || '';
        innerText = innerText.replace(/\s/g, '').substring(0, 20);

        return `<${localName} ${action} ${id} ${className}>${innerText}</${localName}>`;
    }
    setAttrName(name) {
        if (typeof name !== "string") {
            throw new Error("name type string！")
        }
        this.attrName = name
    }
    getAttrName() {
        return this.attrName;
    }
}
