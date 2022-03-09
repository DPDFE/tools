"use strict";
exports.__esModule = true;
exports.generateKey = exports.AjaxStrategy = void 0;
var axios_1 = require("axios");
var AjaxStrategy;
(function (AjaxStrategy) {
    AjaxStrategy[AjaxStrategy["CANCEL_LAST_AT_MOST_ONCE"] = 2] = "CANCEL_LAST_AT_MOST_ONCE";
    AjaxStrategy[AjaxStrategy["CANCEL_CURRENT_AT_MOST_ONCE"] = 4] = "CANCEL_CURRENT_AT_MOST_ONCE";
})(AjaxStrategy = exports.AjaxStrategy || (exports.AjaxStrategy = {}));
var dpd_axios = axios_1["default"];
var oldCreateFn = axios_1["default"].create;
dpd_axios.Axios.prototype.req_pending_list = [];
/**
 * 请发送的request 添加在pending list中
 *
 * @param config - AxiosRequestConfig
 */
dpd_axios.Axios.prototype.addPendingReq = function (config) {
    var pending_req_key = generateKey(config);
    var pending_item = {
        key: pending_req_key,
        method: config.method
    };
    config.cancelToken = new dpd_axios.CancelToken(function (c) {
        pending_item.cancel = c;
    });
    this.req_pending_list.push(pending_item);
};
/**
 * 重写axios创建实例的方法
 *
 * @param config - AxiosRequestConfig
 */
dpd_axios.create = function (config) {
    var _a;
    var instance = oldCreateFn.call(this, config);
    instance.req_pending_list = (_a = instance.req_pending_list) !== null && _a !== void 0 ? _a : [];
    /** 添加请求的拦截器，处理重复请求的strategy策略 */
    instance.interceptors.request.use(function (config) {
        instance.addPendingReq(config);
        config.strategy && instance.removeRepeatReq(config);
        return config;
    }, function (error) {
        return Promise.reject(error);
    });
    /** 添加response拦截器，当请求完成后，在pending列表中移除该请求，方便后续判断pengding中的请求是否有重复的，从而实行重复请求策略*/
    instance.interceptors.response.use(function (response) {
        instance.removeSuccessReq(response);
        return response;
    }, function (error) {
        if (dpd_axios.isCancel(error)) {
            return Promise.reject('重复请求取消');
        }
        return Promise.reject(error);
    });
    return instance;
};
/**
 * 在pending 列表中发现有和当前请求相同的重复请求，
 * 查看当重复请求的策略，选择取消当前请求 或者 停止重复请求
 *
 * @param config - AxiosRequestConfig
 */
dpd_axios.Axios.prototype.removeRepeatReq = function (config) {
    var repeat_index = findRepeatReqIndex(this);
    if (repeat_index > -1) {
        switch (config.strategy) {
            case AjaxStrategy.CANCEL_LAST_AT_MOST_ONCE:
                var prev_pending_req = this.req_pending_list[repeat_index];
                prev_pending_req.cancel();
                this.req_pending_list.splice(repeat_index, 1);
                break;
            case AjaxStrategy.CANCEL_CURRENT_AT_MOST_ONCE:
                var current_pending_req = this.req_pending_list.pop();
                current_pending_req.cancel();
                break;
        }
    }
};
/**
 * 请求移除pending列表中的请求
 *
 * @param response - AxiosResponse
 */
dpd_axios.Axios.prototype.removeSuccessReq = function (response) {
    var target_key = generateKey(response.config);
    this.req_pending_list = this.req_pending_list.filter(function (item) { return item.key !== target_key; });
};
/**
 * 根据请求参数，生成key
 *
 * @param config - AxiosRequestConfig
 * @returns pending_req_key
 */
function generateKey(config) {
    var key = '';
    if (config.bucket) {
        return config.bucket;
    }
    // 处理如url相同请求参数不同时上一个请求被屏蔽的情况
    key =
        config.url +
            config.method +
            JSON.stringify(config.data) +
            JSON.stringify(config.params);
    return key;
}
exports.generateKey = generateKey;
/**
 * requests_pending_list列表中最后一项是当前请求，根据当前请求 查找之前的请求有没有重复的请求
 * 有的话返回重复请求在列表中的index，否则返回-1
 *
 * @param instance -
 * @returns -1 or index
 */
function findRepeatReqIndex(instance) {
    var current_req = instance.req_pending_list.slice(-1)[0];
    return instance.req_pending_list
        .slice(0, instance.req_pending_list.length - 1)
        .findIndex(function (req) { return req.key === current_req.key; });
}
/**
 * 路由变化时可以停止页面中所有的get的请求
 *
 * @param method - Method
 */
dpd_axios.Axios.prototype.cancelReqs = function (method) {
    if (method === void 0) { method = 'get'; }
    this.req_pending_list = this.req_pending_list.filter(function (req) {
        if (req.method === method) {
            req.cancel();
            return false;
        }
        else {
            return true;
        }
    });
};
exports["default"] = dpd_axios;
