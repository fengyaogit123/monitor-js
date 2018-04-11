'use strict'
import QS from 'querystring'
import EventEmitter from './EmitEvent.js'
import Device from 'browser-device-js'

export default class Monitor extends EventEmitter {
    constructor(params = {}) {
        super()
        let { exclude = [], match = [], url, autoPush = true, ...prop } = params;
        this.config = prop;
        this.exclude = exclude;
        this.match = match;
        this.url = url;
        this.autoPush = autoPush;
        this.plugins = []
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
    async captureException(data, callback) {
        let xhr = new XMLHttpRequest();
        xhr.timeout = 10000;
        xhr.open('POST', this.url, true);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && (xhr.status == 200 || xhr.status == 304)) {
                callback && callback.call(this, xhr.responseText);
            }
        };
        xhr.send(QS.stringify({
            ...data,
            actions: JSON.stringify(data.actions)
        }));
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
        this.captureException(data)
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
    async windowError() {
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
    async domEvent() {
        window.addEventListener('click', (e) => {
            let _actions = this.getStorageAction();
            let vnode = this.getHTML(e);
            if (!vnode) return
            _actions.push({
                type: e.type,
                target: vnode,
                time: this.dateFormat(new Date(), "yyyy-MM-dd hh:mm:sss")
            })
            this.setStorageAction(_actions)
        });
    }
    getHTML(e) {
        let { localName, id, className, innerText = '' } = e.target;
        if (['body', 'html'].indexOf(localName) !== -1) return '';
        let action = e.target.getAttribute('action')
        id = id && `id="${id}"` || '';
        className = className && `className="${className}"` || '';
        action = action && `action="${action}"` || '';
        innerText = innerText.replace(/\s/g, '').substring(0, 20);
        return `<${localName} ${action} ${id} ${className}>${innerText}</${localName}>`;
    }
}