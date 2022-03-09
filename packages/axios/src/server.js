const express = require('express'); // 引入 express
const app = express(); // 实例化
const port = 3001; // 设置端口

app.use(express.json()); //使用 json中间件 扩展express功能

// 利用get设置 url
// 前面一部分是根路由  后面一部分是回调函数 并向客户端发送 数据
app.get('/test', async (req, res) => {
    await new Promise((resolve, reject) => {
        setTimeout(resolve, 1000);
    });
    console.log('test');
    res.send('Hello get!');
});

app.post('/test', async (req, res) => {
    await new Promise((resolve, reject) => {
        setTimeout(resolve, 1000);
    });
    res.send('Hello post!');
});

// 监听端口
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
