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
     * sleep
     *
     * @param time - sleep time
     * @returns
     */
    function sleep(time: number) {
        return new Promise((resolve) => {
            setTimeout(resolve, time);
        });
    }

    /**
     * fetch data
     *
     * @param e - ChangeEvent
     */
    async function getData(e?: ChangeEvent) {
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
        });

        //     await sleep(100);
        //     instance.get('/test', {bucket: 'search'});
        //     await sleep(100);
        //     instance.get('/test', {bucket: 'search'});
        // }
    }

    function postData(e?: ChangeEvent) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const value = e ? (e.target as any).value : undefined;
        instance
            ?.post(
                '/test',
                {
                    value,
                },
                {
                    bucket: 'test',
                },
            )
            .then((res) => {
                console.log(res);
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
                    <button type="button" onClick={() => getData()}>
                        get请求
                    </button>

                    <input onChange={getData}></input>
                    <button type="button" onClick={() => cancel()}>
                        router change
                    </button>
                </p>
                <div>
                    <button type="button" onClick={() => postData()}>
                        post请求
                    </button>
                    <input onChange={postData}></input>
                    <button type="button" onClick={() => cancel()}>
                        router change
                    </button>
                </div>
            </header>
        </div>
    );
}

export default App;
