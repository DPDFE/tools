import axios, {AjaxStrategy, generateKey} from '../src/index';

describe('axios 正常功能', () => {
    test('axios([config])', async () => {
        axios({
            method: 'get',
            url: '/test',
        }).then((res) => {
            expect(res.data).toBe('Hello get!');
        });
    });

    test('axios(url, config)', async () => {
        axios('/test', {
            method: 'get',
        }).then((res) => expect(res.data).toBe('Hello get!'));
    });
});
describe('CANCEL_LAST_AT_MOST_ONCE', () => {
    let list: string[] = [];
    const instance = axios.create({
        baseURL: 'http://localhost:3002/api/',
        timeout: 1000000,
        strategy: AjaxStrategy.CANCEL_LAST_AT_MOST_ONCE, // remove 上一个
    });
    test('axios 多个相同的请求，只有最后一个请求会被发送', async () => {
        instance
            .get('/test', {bucket: 'search'})
            .then((res) => {
                list.push(res.data);
            })
            .catch((err) => {
                console.log(err);
            });
        await sleep(100);
        instance
            .get('/test', {bucket: 'search'})
            .then((res) => {
                list.push(res.data);
            })
            .catch((err) => {
                console.log(err);
            });
        await sleep(100);
        const res = await instance.get('/test', {bucket: 'search'});
        list.push(res.data);
        expect(list.length).toBe(1);
    });

    test('axios 拦截器，错误响应处理', async () => {
        // 测试response err
        list = [];
        instance
            .get('/err', {bucket: 'search'})
            .then((res) => {
                list.push(res.data);
            })
            .catch(() => {
                console.log('response  404 err');
            });
        await sleep(2000);
        expect(list.length).toBe(0);
    });
});

describe('CANCEL_LAST_AT_MOST_ONCE', () => {
    test('axios 多个相同的get请求，最多发送一次，如果多次，那么不发起本次请求 ', async () => {
        const list: string[] = [];
        const instance = axios.create({
            baseURL: 'http://localhost:3002/api/',
            timeout: 1000000,
            strategy: AjaxStrategy.CANCEL_CURRENT_AT_MOST_ONCE, // remove 上一个
        });
        instance
            .get('/test', {bucket: 'search2'})
            .then((res) => {
                list.push(res.data);
            })
            .catch(console.log);
        await sleep(100);
        instance
            .get('/test', {bucket: 'search2'})
            .then((res) => {
                list.push(res.data);
            })
            .catch((err) => {
                console.log(err);
            });

        await sleep(2000);

        expect(list.length).toBe(1);
    });
});

describe('测试方法', () => {
    test('路由跳转时，停止上一个页面的所有get请求', async () => {
        const list: string[] = [];
        const instance = axios.create({
            baseURL: 'http://localhost:3002/api/',
            timeout: 1000000,
        });
        instance
            .get('/test', {bucket: 'search2'})
            .then((res) => {
                list.push(res.data);
            })
            .catch(console.log);
        instance
            .get('/test', {bucket: 'search2'})
            .then((res) => {
                list.push(res.data);
            })
            .catch(console.log);
        instance
            .post('/test', {bucket: 'search2'})
            .then((res) => {
                list.push(res.data);
            })
            .catch(console.log);

        await sleep(100);

        instance.cancelReqs();
        await sleep(2000);
        expect(list.length).toBe(1);
    });

    test('测试generateKey， get请求', () => {
        const key = generateKey({
            method: 'get',
            url: '/test',
            params: {id: 1},
        });
        expect(key).toBe('/testgetundefined{"id":1}');
    });

    test('测试generateKey， post请求', () => {
        const key2 = generateKey({
            method: 'post',
            url: '/test',
            data: {id: 1},
        });
        expect(key2).toBe('/testpost{"id":1}undefined');
    });
});

/**
 * sleep
 *
 * @param ms -
 * @returns
 */
function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
