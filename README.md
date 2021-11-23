# tools

纯 js 工具库

# 拼音模糊搜索

## Features

-   支持拼音模糊搜索
-   支持拼音、汉字、英文组合搜索
-   支持排序结果按可信度排序
-   支持多词同时搜索
-   支持设置多词同时搜索时的搜索策略和分隔符

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

-   基础

```
pinYinFuzzSearch('zs', ['是张三', '是李四']);
// output: ['是张三']
```

-   拼音、汉字组合搜索

```
pinYinFuzzSearch('是zs', ['是张三', '是李四']);
// output: ['是张三']
```

-   排序

```
pinYinFuzzSearch('zs', ['张三2', '张三', '张三1'], {
    sort: 'ASC',
});
// output: ['张三', '张三1', '张三2']
```

-   多词搜索（默认是空格分词）

```
pinYinFuzzSearch('是 的', ['是的', '是我的', '的吧'],{
    separator: ' ',
});
// output: ['是的', '是我的']
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
