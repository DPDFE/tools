const express = require('express'); // 引入 express
const app = express(); // 实例化
const port = 3001; // 设置端口

app.use(express.json()); //使用 json中间件 扩展express功能

app.get('/test', async (req, res) => {
    await new Promise((resolve) => {
        setTimeout(resolve, 1000);
    });
    console.log('test');
    res.send('Hello get!');
});

app.post('/test', async (req, res) => {
    await new Promise((resolve) => {
        setTimeout(resolve, 1000);
    });
    res.send('Hello post!');
});

// 监听端口
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
