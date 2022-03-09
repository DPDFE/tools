import axios, {
    Axios,
    Axios as OldAxios,
    AxiosInstance,
    AxiosRequestConfig,
    AxiosRequestConfig as OldAxiosRequestConfig,
    AxiosResponse,
    AxiosStatic,
    Canceler,
    Method,
} from 'axios';

/**
 * axios
 */
declare module 'axios' {
    /**
     * 覆写AxiosRequestConfig定义
     */
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    export interface AxiosRequestConfig extends OldAxiosRequestConfig {
        /** 自定义axios策略 */
        strategy?: AjaxStrategy;

        /** 请求的key,可用于分组，重复bucket的请求，可以通过自定义策略进行取消等操作 */
        bucket?: string;
    }

    /**
     * 覆写AxiosStatic定义
     */
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    export interface Axios extends OldAxios {
        /** pengding中的请求列表 */
        req_pending_list: reqPendingItem[];

        /**
         * addPendingReq
         *
         * @param config
         */
        addPendingReq(config: AxiosRequestConfig): void;

        /** 在pending列表中删除已经解决的请求 */
        removeSuccessReq: (config: AxiosResponse<unknown>) => void;

        /** 停止重复的请求 */
        removeRepeatReq: (config: AxiosRequestConfig) => void;

        /** 移除所有的请求 */
        cancelReqs: (method?: Method) => void;
    }
}

export enum AjaxStrategy {
    CANCEL_LAST_AT_MOST_ONCE = 0b10,
    CANCEL_CURRENT_AT_MOST_ONCE = 0b100,
}

/**
 * pending 请求列表项
 */
export interface reqPendingItem {
    /** 请求的唯一表示，由url method params/data 组成 */
    key: string;
    /** 请求的方法：get / post */
    method?: Method;
    /**
     * 取消请求的方法
     */
    cancel?: Canceler;
}

const dpd_axios = axios as unknown as AxiosStatic;
const oldCreateFn = axios.create;

(dpd_axios.Axios.prototype as Axios).req_pending_list = [];

/**
 * 请发送的request 添加在pending list中
 *
 * @param config - AxiosRequestConfig
 */
(dpd_axios.Axios.prototype as Axios).addPendingReq = function (
    config: AxiosRequestConfig,
) {
    const pending_req_key = generateKey(config);
    const pending_item: reqPendingItem = {
        key: pending_req_key,
        method: config.method,
    };
    config.cancelToken = new dpd_axios.CancelToken((c) => {
        pending_item.cancel = c;
    });
    this.req_pending_list.push(pending_item);
};

/**
 * 重写axios创建实例的方法
 *
 * @param config - AxiosRequestConfig
 */
dpd_axios.create = function (config?: AxiosRequestConfig) {
    const instance = oldCreateFn.call(this, config) as unknown as AxiosInstance;
    instance.req_pending_list = instance.req_pending_list ?? [];

    /** 添加请求的拦截器，处理重复请求的strategy策略 */
    instance.interceptors.request.use(
        (config: AxiosRequestConfig) => {
            instance.addPendingReq(config);

            config.strategy && instance.removeRepeatReq(config);
            return config;
        },
        function (error) {
            return Promise.reject(error);
        },
    );

    /** 添加response拦截器，当请求完成后，在pending列表中移除该请求，方便后续判断pengding中的请求是否有重复的，从而实行重复请求策略*/
    instance.interceptors.response.use(
        (response) => {
            instance.removeSuccessReq(response);
            return response;
        },
        (error) => {
            if (dpd_axios.isCancel(error)) {
                return Promise.reject('重复请求取消');
            }
            return Promise.reject(error);
        },
    );

    return instance as AxiosInstance;
};

/**
 * 在pending 列表中发现有和当前请求相同的重复请求，
 * 查看当重复请求的策略，选择取消当前请求 或者 停止重复请求
 *
 * @param config - AxiosRequestConfig
 */
(dpd_axios.Axios.prototype as Axios).removeRepeatReq = function (
    config: AxiosRequestConfig,
) {
    const repeat_index = findRepeatReqIndex(this);

    if (repeat_index > -1) {
        switch (config.strategy) {
            case AjaxStrategy.CANCEL_LAST_AT_MOST_ONCE:
                const prev_pending_req = this.req_pending_list[repeat_index];
                prev_pending_req.cancel!();
                this.req_pending_list.splice(repeat_index, 1);
                break;
            case AjaxStrategy.CANCEL_CURRENT_AT_MOST_ONCE:
                const current_pending_req = this.req_pending_list.pop();
                current_pending_req!.cancel!();
                break;
        }
    }
};

/**
 * 请求移除pending列表中的请求
 *
 * @param response - AxiosResponse
 */
(dpd_axios.Axios.prototype as Axios).removeSuccessReq = function (
    response: AxiosResponse<unknown>,
) {
    const target_key = generateKey(response.config);
    this.req_pending_list = this.req_pending_list.filter(
        (item) => item.key !== target_key,
    );
};

/**
 * 根据请求参数，生成key
 *
 * @param config - AxiosRequestConfig
 * @returns pending_req_key
 */
export function generateKey(config: AxiosRequestConfig) {
    let key = '';
    if (config.bucket) {
        return config.bucket;
    }
    // 处理如url相同请求参数不同时上一个请求被屏蔽的情况
    key =
        config.url +
        config.method! +
        JSON.stringify(config.data) +
        JSON.stringify(config.params);

    return key;
}

/**
 * requests_pending_list列表中最后一项是当前请求，根据当前请求 查找之前的请求有没有重复的请求
 * 有的话返回重复请求在列表中的index，否则返回-1
 *
 * @param instance -
 * @returns -1 or index
 */
function findRepeatReqIndex(instance: Axios) {
    const current_req = instance.req_pending_list.slice(-1)[0];
    return instance.req_pending_list
        .slice(0, instance.req_pending_list.length - 1)
        .findIndex((req) => req.key === current_req.key);
}

/**
 * 路由变化时可以停止页面中所有的get的请求
 *
 * @param method - Method
 */
(dpd_axios.Axios.prototype as Axios).cancelReqs = function (method = 'get') {
    this.req_pending_list = this.req_pending_list.filter((req) => {
        if (req.method === method) {
            req.cancel!();
            return false;
        } else {
            return true;
        }
    }) as reqPendingItem[];
};

export default dpd_axios;
