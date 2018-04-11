'use strict'
import Vue from 'vue'
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
            route: route,//路由
            details: details + '   ' + info,//
            errorDetails: error.stack,//堆栈详情
        }
        this.pushException(data)

        origin(arguments)
    }
}
window.vuePlugin = vuePlugin