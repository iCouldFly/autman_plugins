//[author: jusbe]
//[title: 超级time]
//[language: nodejs]
//[class: 工具类]
//[service: Jusbe] 售后联系方式
//[disable: false] 禁用开关，true表示禁用，false表示可用
//[admin: false] 是否为管理员指令
//[rule: ^time$]
//[priority: 1] 优先级，数字越大表示优先级越高
//[platform: all] 适用的平台
//[open_source: true]是否开源
//[icon: 图标url]图标链接地址，请使用48像素的正方形图标，支持http和https
//[version: 1.0.0]版本号
//[public: false] 是否发布？值为true或false，不设置则上传aut云时会自动设置为true，false时上传后不显示在市场中，但是搜索能搜索到，方便开发者测试
//[price: 2] 上架价格
//[description: nodejs重制版] 

const { exec } = require('child_process');

const middleware = require('./middleware.js');
const senderID = middleware.getSenderID();
let s = new middleware.Sender(senderID)

// code by 问小白/Deepseek
exec('date +"%Y-%m-%d %H:%M:%S.%N"', (error, stdout) => {
    s.reply(stdout)
})
