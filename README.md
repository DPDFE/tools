# tools

本项目包含一系列纯 JS 工具库。

[![npm-image](https://img.shields.io/npm/v/@dpdfe/tools.svg?style=flat-square)](https://www.npmjs.com/package/@dpdfe/tools)
![Test Status](https://github.com/DPDFE/tools/actions/workflows/jest.yml/badge.svg?1)

# 拼音模糊搜索

## Features

-   支持拼音模糊搜索
-   支持拼音、汉字、英文组合搜索
-   支持排序结果排序
-   支持多词同时搜索
-   支持设置多词同时搜索时的排序策略和分隔符
-   支持返回匹配位置

拼音模糊搜索[详细使用指南](https://github.com/DPDFE/tools/wiki/%E6%8B%BC%E9%9F%B3%E6%A8%A1%E7%B3%8A%E6%90%9C%E7%B4%A2)

# axios 策略

## Features

-   支持配置策略同一个请求，最多发送一次，如果发送多次，自动取消上次请求
-   支持配置策略同一个请求，最多发送一次，触发多次，不发送本次请求
-   提供取消页面所有请求的方法.
