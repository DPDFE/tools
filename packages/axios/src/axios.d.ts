/* eslint-disable */
import 'axios';
import {AxiosRequestConfig as OldAxiosRequestConfig} from 'axios';
import {AjaxStrategy, reqPendingItem} from '.';

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
