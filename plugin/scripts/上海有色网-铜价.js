//[author: jusbe]
//[title: 上海有色网-铜价]
//[language: nodejs]
//[class: 工具类]
//[service: Jusbe] 售后联系方式
//[disable: false] 禁用开关，true表示禁用，false表示可用
//[admin: true] 是否为管理员指令
//[rule: ^(.*)铜价$] 匹配规则，多个规则时向下依次写多个
//[priority: 1] 优先级，数字越大表示优先级越高
//[platform: all] 适用的平台
//[open_source: false]是否开源
//[icon: 图标url]图标链接地址，请使用48像素的正方形图标，支持http和https
//[version: 1.0.0]版本号
//[public: true] 是否发布？值为true或false，不设置则上传aut云时会自动设置为true，false时上传后不显示在市场中，但是搜索能搜索到，方便开发者测试
//[price: 2] 上架价格
//[description: 命令: (长江,上海,广东,鹰潭,山东,河南,华东,华北,西南)铜价, 直接发"铜价"为长江铜价<br>自行设置 定时推送<br>首发：20240402<br><img src="https://bbs.autman.cn/assets/files/2024-06-24/1719215802-166070-596ba2ee-b27d-4480-8afe-6f34db11f07f.jpg" alt="上海有色网-铜价" />] 使用方法尽量写具体

const middleware = require('./middleware.js');
const axios = require('axios');
const cheerio = require('cheerio');

const senderID = middleware.getSenderID();
const s = new middleware.Sender(senderID)

!(async () => {
    const param1 = await s.param(1)

    let addr = param1 || "长江"

    // 加载 HTML 内容
    const response = await axios.get('https://hq.smm.cn/h5/cu');
    const $ = cheerio.load(response.data);
    // 提取表格行数据
    const rows = $('tr.ant-table-row');
    const data = [];

    // 遍历表格行并提取数据
    const titlies = ["名称", "价格范围", "均价", "涨跌", "单位", "日期"]
    rows.each((index, row) => {
        const cells = $(row).find('td.ant-table-cell');
        const rowData = {};
        cells.each((cellIndex, cell) => {
            const cellText = $(cell).text().trim();
            rowData[titlies[cellIndex]] = cellText
        });
        data.push(rowData);
    });
    console.table(data)
    // debugger

    let _d = data.filter(v => { return v["名称"].includes(addr) })
    if (!_d[0]) return false

    let msg = ""
    for (let a in _d[0]) {
        msg += `${a}: ${_d[0][a]}\n`
    }
    s.reply(msg)
})()
