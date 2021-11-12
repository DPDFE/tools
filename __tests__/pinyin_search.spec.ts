/// <reference types="jest" />

import pinYinFuzzSearch, {PinYinFuzzSearchOption} from '@/pinyin_search';

describe('拼音搜索工具 › multiple 参数', () => {
    // 为避免返回顺序导致测试结果不一致，这里将sort参数强制保持原始顺序
    const options: PinYinFuzzSearchOption<string> = {sort: 'raw'};

    test('任意匹配就返回', () => {
        const result = pinYinFuzzSearch('是 的', ['的', '是1', '2'], {
            multiple: 'ANY',
            ...options,
        });
        expect(result).toEqual(['的', '是1']);
    });

    test('全部匹配才返回', () => {
        const word = '是 的';
        const list = ['是的', '是我的', '是吧'];
        const expected = ['是的', '是我的'];
        const result = pinYinFuzzSearch(word, list, {
            multiple: 'ALL',
            ...options,
        });
        const default_result = pinYinFuzzSearch(word, list, options);
        expect(default_result).toEqual(expected);
        expect(result).toEqual(expected);
    });
});

describe('拼音搜索工具 › sort 参数', () => {
    test('返回顺序与传递顺序要一致', () => {
        const result = pinYinFuzzSearch('是', ['是3', '是1', '是2'], {
            sort: 'raw',
        });
        expect(result).toEqual(['是3', '是1', '是2']);
    });

    test('匹配度高，越靠前，相似度相同，则字母升序', () => {
        const word = '是的';
        const list = ['是的2', '是的', '是的1'];
        const expected = ['是的', '是的1', '是的2'];

        const result = pinYinFuzzSearch(word, list, {
            sort: 'auto',
        });
        const default_result = pinYinFuzzSearch(word, list);
        expect(default_result).toEqual(expected);
        expect(result).toEqual(expected);
    });

    test('升序返回', () => {
        const result = pinYinFuzzSearch('是的', ['是的2', '是的', '是的1'], {
            sort: 'asc',
        });
        expect(result).toEqual(['是的', '是的1', '是的2']);
    });

    test('降序返回', () => {
        const result = pinYinFuzzSearch('是的', ['是的2', '是的', '是的1'], {
            sort: 'desc',
        });
        expect(result).toEqual(['是的2', '是的1', '是的']);
    });
});

describe('拼音搜索工具 › separator 参数', () => {
    // 为避免返回顺序导致测试结果不一致
    const options: PinYinFuzzSearchOption<string> = {
        sort: 'raw',
    };

    test('英文逗号分割', () => {
        const result = pinYinFuzzSearch(
            '是 ,的',
            ['是我的', '是 的', '是,的', '是 ,我的'],
            {
                separator: ',',
                ...options,
            },
        );
        expect(result).toEqual(['是 的', '是 ,我的']);
    });

    test('默认值空格分割', () => {
        const word = '是 的';
        const list = ['是的', '是我的', '的是吧'];
        const expected = ['是的', '是我的'];
        const result = pinYinFuzzSearch(word, list, {
            separator: ' ',
            ...options,
        });
        // 测试默认值
        const default_result = pinYinFuzzSearch(word, list, options);
        expect(default_result).toEqual(expected);
        expect(result).toEqual(expected);
    });
});

describe('拼音搜索工具 › 功能', () => {
    test('支持中文，支持模糊搜索', () => {
        const result = pinYinFuzzSearch('是三', ['是张三', '是李四']);
        expect(result).toEqual(['是张三']);
    });

    test('支持拼音、中文、英文，支持模糊搜索', () => {
        const result = pinYinFuzzSearch('是ah', ['是张三hi', '是李四ha']);
        expect(result).toEqual(['是张三']);
    });

    test('支持拼音模糊搜索', () => {
        const result = pinYinFuzzSearch('zs', ['是张三', '是李四']);
        expect(result).toEqual(['是张三']);
    });

    test('支持多词语同时搜索，逗号分隔搜索词', () => {
        const result = pinYinFuzzSearch('张,ls', ['是张三', '是李四'], {
            multiple: 'ANY',
            separator: ',',
        });
        expect(result).toEqual(['是张三', '是李四']);
    });

    test('无匹配结果时返回空数组', () => {
        const result = pinYinFuzzSearch('404', ['是张三', '是李四']);
        expect(result).toEqual([]);
    });

    test('自定义供用户匹配的字段', () => {
        const result = pinYinFuzzSearch(
            'ls',
            [
                {name: '是张三', id: 1},
                {name: '是李四', id: 2},
            ],
            {
                /** @param item - - */
                textProvider: (item) => item.name,
            },
        );
        expect(result).toEqual([{name: '是李四', id: 2}]);
    });

    test('自定义供用户匹配的字段', () => {
        const result = pinYinFuzzSearch(
            'ls',
            [
                {name: '是张三', id: 1},
                {name: '是李四', id: 2},
            ],
            {
                /** @param item - - */
                textProvider: (item) => item.name,
            },
        );
        expect(result).toEqual([{name: '是李四', id: 2}]);
    });
});
