/// <reference types="jest" />

import pinYinFuzzSearch, {PinYinFuzzSearchOption} from '../src/pinyin_search';

describe('拼音搜索工具 › multiple 参数', () => {
    // 为避免返回顺序导致测试结果不一致，这里将sort参数强制保持原始顺序
    const options: PinYinFuzzSearchOption<string> = {sort: 'RAW'};

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
            sort: 'RAW',
        });
        expect(result).toEqual(['是3', '是1', '是2']);
    });

    test('匹配度高，越靠前，相似度相同，则字母升序', () => {
        const word = '是的';
        const list = ['是的2', '是的', '是的1'];
        const expected = ['是的', '是的1', '是的2'];

        const result = pinYinFuzzSearch(word, list, {
            sort: 'AUTO',
        });
        const default_result = pinYinFuzzSearch(word, list);
        expect(default_result).toEqual(expected);
        expect(result).toEqual(expected);
    });

    test('按照匹配词位置优先排序', () => {
        const result = pinYinFuzzSearch('sx', ['四川省', '山西省', '陕西省'], {
            sort: 'AUTO',
        });
        expect(result).toEqual(['山西省', '陕西省', '四川省']);
    });

    test('升序返回', () => {
        const result = pinYinFuzzSearch('是的', ['是的2', '是的', '是的1'], {
            sort: 'ASC',
        });
        expect(result).toEqual(['是的', '是的1', '是的2']);
    });

    test('降序返回', () => {
        const result = pinYinFuzzSearch('是的', ['是的2', '是的', '是的1'], {
            sort: 'DESC',
        });
        expect(result).toEqual(['是的2', '是的1', '是的']);
    });
});

describe('拼音搜索工具 › separator 参数', () => {
    // 为避免返回顺序导致测试结果不一致
    const options: PinYinFuzzSearchOption<string> = {
        sort: 'RAW',
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
        expect(result).toEqual(['是我的', '是 的', '是,的', '是 ,我的']);
    });

    test('默认值空格分割', () => {
        const word = '是 的';
        const list = ['是的', '是我的', '的吧'];
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
        const result = pinYinFuzzSearch('是zs', ['是张三hi', '是李四ha']);
        expect(result).toEqual(['是张三hi']);
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

    test('首字母匹配', () => {
        const result = pinYinFuzzSearch(
            'bj,tj,shs',
            ['北京市', '天津市', '浙江省', '山西省', '上海市', '河北省'],
            {
                multiple: 'ANY',
                separator: ',',
            },
        );
        expect(result).toEqual(['北京市', '天津市', '上海市']);
    });

    test('多音字', () => {
        const result_a = pinYinFuzzSearch(
            'sdi',
            ['是的', '使得', '似的', '师德', '好的', '湿地'],
            {
                sort: 'RAW',
            },
        );
        expect(result_a).toEqual(['是的', '似的', '湿地']);
    });

    test('首字母，多音字', () => {
        const result_a = pinYinFuzzSearch(
            'njszj,ddxz',
            ['南京市长江大桥', '南京市长', '长江大桥', '东躲西藏', '西藏'],
            {
                multiple: 'ANY',
                separator: ',',
            },
        );
        const result_b = pinYinFuzzSearch(
            'njscj,xc',
            ['南京市长江大桥', '南京市长', '长江大桥', '东躲西藏', '西藏'],
            {
                multiple: 'ANY',
                separator: ',',
                sort: 'RAW',
            },
        );
        expect(result_a).toEqual(['南京市长江大桥', '东躲西藏']);
        expect(result_b).toEqual(['南京市长江大桥', '东躲西藏', '西藏']);
    });

    test('中文拼音混输', () => {
        const result_a = pinYinFuzzSearch(
            '是我de',
            ['是的', '我的', '是我的', '是的我', '不是我的', '是不我的'],
            {
                sort: 'RAW',
            },
        );
        const result_b = pinYinFuzzSearch(
            '是wo的',
            ['是的', '我的', '是我的', '是的我', '不是我的', '是不我的'],
            {
                sort: 'RAW',
            },
        );
        const result_c = pinYinFuzzSearch(
            'shi我的',
            ['是的', '我的', '是我的', '是的我', '不是我的', '是不我的'],
            {
                sort: 'RAW',
            },
        );
        const result_d = pinYinFuzzSearch(
            'shi我de',
            ['是的', '我的', '是我的', '是的我', '不是我的', '是不我的'],
            {
                sort: 'RAW',
            },
        );
        const result_e = pinYinFuzzSearch(
            'si我de',
            ['是的', '我的', '是我的', '是的我', '不是我的', '是不我的'],
            {
                sort: 'RAW',
            },
        );
        expect(result_a).toEqual(['是我的', '不是我的', '是不我的']);
        expect(result_b).toEqual(['是我的', '不是我的', '是不我的']);
        expect(result_c).toEqual(['是我的', '不是我的', '是不我的']);
        expect(result_d).toEqual(['是我的', '不是我的', '是不我的']);
        expect(result_e).toEqual([]);
    });

    test('中文拼音首字母混输', () => {
        const result_a = pinYinFuzzSearch(
            '是我d',
            ['是的', '我的', '是我的', '是的我', '不是我的', '是不我的'],
            {
                sort: 'RAW',
            },
        );
        const result_b = pinYinFuzzSearch(
            '是w的',
            ['是的', '我的', '是我的', '是的我', '不是我的', '是不我的'],
            {
                sort: 'RAW',
            },
        );
        const result_c = pinYinFuzzSearch(
            's我的',
            ['是的', '我的', '是我的', '是的我', '不是我的', '是不我的'],
            {
                sort: 'RAW',
            },
        );
        const result_d = pinYinFuzzSearch(
            's我d',
            ['是的', '我的', '是我的', '是的我', '不是我的', '是不我的'],
            {
                sort: 'RAW',
            },
        );

        expect(result_a).toEqual(['是我的', '不是我的', '是不我的']);
        expect(result_b).toEqual(['是我的', '不是我的', '是不我的']);
        expect(result_c).toEqual(['是我的', '不是我的', '是不我的']);
        expect(result_d).toEqual(['是我的', '不是我的', '是不我的']);
    });

    test('花名匹配', () => {
        const result_a = pinYinFuzzSearch(
            'zhangsan01',
            ['张三01', '张三02', '张三03', '李四01', '李四02', '王五03'],
            {
                sort: 'RAW',
            },
        );
        const result_b = pinYinFuzzSearch(
            'zs01',
            ['张三01', '张三02', '张三03', '李四01', '李四02', '王五03'],
            {
                sort: 'RAW',
            },
        );
        const result_c = pinYinFuzzSearch(
            'zhangsan',
            [
                'zhangsan01',
                'zhangsan02',
                'zhangsan03',
                'lisi01',
                'lisi02',
                'wangwu03',
            ],
            {
                sort: 'RAW',
            },
        );
        const result_d = pinYinFuzzSearch(
            'zhangsan01',
            [
                'zhangsan01',
                'zhangsan02',
                'zhangsan03',
                'lisi01',
                'lisi02',
                'wangwu03',
            ],
            {
                sort: 'RAW',
            },
        );
        const result_e = pinYinFuzzSearch(
            'zs01',
            [
                'zhangsan01',
                'zhangsan02',
                'zhangsan03',
                'lisi01',
                'lisi02',
                'wangwu03',
            ],
            {
                sort: 'RAW',
            },
        );

        expect(result_a).toEqual(['张三01']);
        expect(result_b).toEqual(['张三01']);
        expect(result_c).toEqual(['zhangsan01', 'zhangsan02', 'zhangsan03']);
        expect(result_d).toEqual(['zhangsan01']);
        expect(result_e).toEqual(['zhangsan01']);
    });

    test('长列表匹配', () => {
        const list = [
            '石室诗士施氏',
            '嗜狮',
            '誓食十狮',
            '施氏时时适市视狮',
            '十时',
            '适十狮适市',
            '是时',
            '适施氏适市',
            '施氏视是十狮',
            '恃矢势',
            '使是十狮逝世',
            '氏拾是十狮尸',
            '适石室',
            '石室湿',
            '氏使侍拭石室',
            '石室拭',
            '施氏始试食是十狮尸',
            '食时',
            '始识是十狮尸',
            '实十石狮尸',
            '试释是事',
        ];
        const mut = 100;

        const result_a = pinYinFuzzSearch(
            'shishi',
            Array.from(
                {length: list.length * mut},
                (_, i) => list[i % list.length] + i,
            ),
            {
                sort: 'RAW',
            },
        );

        expect(result_a).toEqual(
            Array.from(
                {length: list.length * mut},
                (_, i) => list[i % list.length] + i,
            ),
        );
    });

    test('无匹配结果时返回空数组', () => {
        const result = pinYinFuzzSearch('404', ['是张三', '是李四']);
        expect(result).toEqual([]);
    });

    test('English', () => {
        const result = pinYinFuzzSearch('de', [
            'Not Identified',
            'Closed',
            'Communicated',
            'Identified',
            'Resolved',
            'Cancelled',
        ]);
        expect(result).toEqual(['Identified', 'Not Identified']);
    });

    test('Number', () => {
        const result = pinYinFuzzSearch('1', [1, 2, 3, 4]);
        expect(result).toEqual([1]);
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
