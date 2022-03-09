import {ChangeEvent} from 'react';
import axios, {AjaxStrategy} from '../../src/index';
import './App.css';

/**
 * react demo页
 *
 * @returns
 */
function App() {
    const instance = axios.create({
        baseURL: 'http://localhost:3002/api/',
        timeout: 1000000,
        strategy: AjaxStrategy.CANCEL_LAST_AT_MOST_ONCE, // remove 上一个
    });

    /**
     * fetch data
     *
     * @param e - ChangeEvent
     * @param strategy - AjaxStrategy
     */
    async function getData(e: ChangeEvent, strategy: AjaxStrategy) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const value = e ? (e.target as any).value : undefined;
        instance?.interceptors.request.use(
            function (config) {
                // 在发送请求之前做些什么
                return config;
            },
            function (error) {
                // 对请求错误做些什么
                return Promise.reject(error);
            },
        );
        instance.get('/test', {
            params: {
                value,
            },
            bucket: 'search',
            strategy,
        });
    }

    /**
     * 停掉上一个页面中的路由请求
     */
    function cancel() {
        instance.cancelReqs();
    }

    return (
        <div className="App">
            <header className="App-header">
                <p>
                    发送多次请求，有相同请求还未响应，则cancel未响应的请求(
                    <span style={{fontSize: 12}}>CANCEL_LAST_AT_MOST_ONCE</span>
                    )：
                    <input
                        onChange={(e) =>
                            getData(e, AjaxStrategy.CANCEL_LAST_AT_MOST_ONCE)
                        }
                    ></input>
                </p>
                <div>
                    发送多次请求，有相同请求还未响应，则不发送当前请求（
                    <span style={{fontSize: 12}}>
                        CANCEL_CURRENT_AT_MOST_ONCE
                    </span>
                    )：
                    <input
                        onChange={(e) =>
                            getData(e, AjaxStrategy.CANCEL_CURRENT_AT_MOST_ONCE)
                        }
                    ></input>
                </div>
                <div style={{marginTop: 20}}>
                    路由变化时，可以取消未响应的请求：
                    <button type="button" onClick={() => cancel()}>
                        cancel
                    </button>
                </div>
            </header>
        </div>
    );
}

export default App;
