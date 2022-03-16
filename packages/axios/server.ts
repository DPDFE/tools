const express = require('express'); // 引入 express
const app = express(); // 实例化
const port = 3001; // 设置端口

app.use(express.json()); //使用 json中间件 扩展express功能

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
app.get('/test', async (req, res) => {
    await new Promise((resolve) => {
        setTimeout(resolve, 1000);
    });
    console.log('进来了');
    res.send('Hello get!');
});

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
app.post('/test', async (req, res) => {
    await new Promise((resolve) => {
        setTimeout(resolve, 1000);
    });
    res.send('Hello post!');
});

// 监听端口
const server = app.listen(port, () =>
    console.log(`Example app listening on port ${port}!`),
);

module.exports = server;
