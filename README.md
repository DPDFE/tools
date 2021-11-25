# tools

纯 js 工具库

# 拼音模糊搜索

## Features

-   支持拼音模糊搜索
-   支持拼音、汉字、英文组合搜索
-   支持排序结果排序
-   支持多词同时搜索
-   支持设置多词同时搜索时的排序策略和分隔符

## 安装

-   使用 npm:

```
npm i --save @dpdfe/tools
```

-   引入

```
import {pinYinFuzzSearch} from '@dpdfe/tools'
```

## 使用方法

-   基础拼音搜索

```
pinYinFuzzSearch('shizhangsan', ['是张三', '是李四']); // output: ['是张三']


pinYinFuzzSearch('zhangsan', ['是张三', '是李四']); // output: ['是张三']
```

-   拼音首字母搜素

```
pinYinFuzzSearch('szs', ['是张三', '是李四']); // output: ['是张三']


pinYinFuzzSearch('shizs', ['是张三', '是李四']); // output: ['是张三']


pinYinFuzzSearch('zs', ['是张三', '是李四']); // output: ['是张三']


pinYinFuzzSearch('ss', ['是张三', '是李四']); // output: ['是张三', '是李四']
```

-   多音字

```
pinYinFuzzSearch('xizang', ['西藏']); // output: ['西藏']


pinYinFuzzSearch('xicang', ['西藏']); // output: ['西藏']
```

-   拼音、汉字组合搜索

```
pinYinFuzzSearch('是zhangsan', ['是张三', '是李四']); // output: ['是张三']


pinYinFuzzSearch('是zhang', ['是张三', '是李四']); // output: ['是张三']


pinYinFuzzSearch('s张san', ['是张三', '是李四']); // output: ['是张三']


pinYinFuzzSearch('是zs', ['是张三', '是李四']); // output: ['是张三']


pinYinFuzzSearch('是s', ['是张三', '是李四']); // output: ['是张三', '是李四']
```

-   排序

```
pinYinFuzzSearch('zs', ['张三2', '张三', '张三1'], {sort: 'ASC'});
// output: ['张三', '张三1', '张三2']


pinYinFuzzSearch('zs', ['张三2', '张三', '张三1'], {sort: 'DESC'});
// output: ['张三2', '张三1', '张三']


pinYinFuzzSearch('zs', ['张三2', '张三', '张三1'], {sort: 'RAW'});
// output: ['张三2', '张三', '张三1']


pinYinFuzzSearch('zs', ['张三丰2', '张三', '张三丰'], {sort: 'AUTO'});
// output: ['张三', '张三丰', '张三丰2']
```

-   多词搜索

```
pinYinFuzzSearch('是 的', ['是的', '是我的', '的吧']);
// output: ['是的', '是我的']


pinYinFuzzSearch('是,的', ['是的', '是我的', '的吧'], {separator: ','});
// output: ['是的', '是我的']
```

-   多词搜索策略

```
pinYinFuzzSearch('dd xc', ['东躲', '西藏', '东躲西藏'], { multiple: 'ANY' });
// output: ['东躲', '西藏', '东躲西藏']


pinYinFuzzSearch('dd xc', ['东躲', '西藏', '东躲西藏'], { multiple: 'ALL' });
// output: ['东躲西藏']
```

-   自定义匹配字段

```
pinYinFuzzSearch('zhangsan',
[
    {name:'张三', age:18, gender:null},
    {name:'李四', age:20, gender:'male'},
    {name:'张三丰', gender:'male'},
],
{
    textProvider:(item)=>item.name
});
// output: [{name:'张三', age:18, gender:null}]
```

-   复杂例子

```
pinYinFuzzSearch(
    'njscj,xc',
    ['南京市长江大桥', '南京市长', '长江大桥', '东躲西藏', '西藏'],
    {
        multiple: 'ANY',
        separator: ',',
        sort: 'RAW',
    },
);
// output: ['南京市长江大桥', '东躲西藏', '西藏']
```

## API

```
pinYinFuzzSearch<T>(
    word: string,
    list: T[],
    options?: PinYinFuzzSearchOption<T>,
): T[]
```

| 参数    | 类型                       | 说明                             | 默认值 |
| ------- | -------------------------- | -------------------------------- | ------ |
| word    | String                     | 待匹配的输入词                   | -      |
| list    | T[]                        | 待匹配项列表                     | -      |
| options | PinYinFuzzSearchOption\<T> | 多词同时搜索时，分隔符，默认空格 | -      |

```
interface PinYinFuzzSearchOption<T> {
    sort?: 'ASC' | 'DESC' | 'AUTO' | 'RAW';

    multiple?: 'ALL' | 'ANY';

    separator?: string;

    textProvider?: (item: T) => string;
}
```

| 参数         | 类型                               | 说明                                                                                                                                         | 默认值 |
| ------------ | ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| sort         | 'ASC' \| 'DESC' \| 'AUTO' \| 'RAW' | AUTO: 是否将匹配后的结果按照匹配相似度排序，相信度越高，在结果数组中越靠前，如果相似度相同，则按照字母升序。如果为 RAW，则按照用户传入的顺序 | AUTO   |
| multiple     | 'ALL' \| 'ANY'                     | 多词同时搜索时，搜索策略，ALL(需全部命中，默认值)、ANY(命中一个即可)                                                                         | ALL    |
| separator    | String                             | 多词同时搜索时，分隔符，默认空格                                                                                                             | ' '    |
| textProvider | (item: T) => string                | 自定义提供要匹配的字段                                                                                                                       | -      |
