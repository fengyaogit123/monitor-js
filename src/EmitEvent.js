'use strict'
export default class EventEmitter {
    constructor() {
        this.listens = {}
    }
    on(type, func) {
        let callbacks = this.listens[type];
        this.listens[type] = callbacks || [];
        this.listens[type].push(func);
        return this;
    }
    emit(type, data) {
        let callbacks = this.listens[type];
        if (callbacks && callbacks.length > 0) {
            callbacks.map((func) => {
                func.call(this, data);
            });
        }
        return this;
    }
    remove(type, func) {
        let callbacks = this.listens[type];
        if (func) {
            let result = callbacks.filter((_func) => {
                return _func !== func
            });
            if (result.length !== callbacks.length) {
                this.listens[type] = result;
            }
            return this;
        }
        this.listens[type] = undefined;
        return this;
    }
    removeAll() {
        this.listens = {}
        return this;
    }
}