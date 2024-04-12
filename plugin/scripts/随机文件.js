//[title: 随机文件]
//[language: nodejs]
//[class: 工具类]
//[service: Jusbe] 售后联系方式
//[disable: false] 禁用开关，true表示禁用，false表示可用
//[admin: false] 是否为管理员指令
//[rule: raw (随机文件)(.*)] 匹配规则，多个规则时向下依次写多个
//[priority: 1] 优先级，数字越大表示优先级越高
//[platform: all] 适用的平台
//[open_source: false]是否开源
//[icon: 图标url]图标链接地址，请使用48像素的正方形图标，支持http和https
//[version: 1.0.0]版本号
//[public: false] 是否发布？值为true或false，不设置则上传aut云时会自动设置为true，false时上传后不显示在市场中，但是搜索能搜索到，方便开发者测试
//[price: 999] 上架价格
//[description: 发送“文件收集.js”下载的文件，目前只支持图片] 使用方法尽量写具体

// [tg]我的群组：-1001754696433
// [tg]小爱同学：1159241609
// [tg]深圳外围：1774635289
// [tg]朱颜别镜 | 妹子图 | 美女图：1604423588
// [tg]少女实在是太美好了：1241814235
// [tg]幻想高质量美图［NSFW］：1333455571
// [tg]美女收集器👗：1855542885
// [tg]硬盘仓库[NSFW]：1821801321
// [tg]足控天堂：1166727452
// [tg]美女🍑写真：1157979657

const pic_num = 3 // 每次发送图片数量
const timeout = 60 // 等待时间，秒
const delay = 3 // 延时，秒
let src = "美女🍑写真" // 默认目录名

const middleware = require('./middleware.js');
// const request = require('request');
// const Headers = require('Headers');
// const fetch = require('fetch');
// const sleep = require('sleep');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const senderID = middleware.getSenderID();
const s = new middleware.Sender(senderID)

!(async () => {
    // const is_admin = await s.isAdmin()
    const plugin_name = await s.getPluginName()
    // const plugin_version = await s.getPluginVersion()
    // const user_avatar_url = await s.getUserAvatarUrl()
    const username = await s.bucketGet("cloud", "username")
    const password = await s.bucketGet("cloud", "password")
    const im = await s.getImtype()
    const user_id = await s.getUserID()
    const user_name = await s.getUserName()
    const group_name = await s.getGroupName()
    const group_id = await s.getChatID()
    const param1 = await s.param(1)
    const param2 = await s.param(2)
    // const param3 = await s.param(3)
    const message = await s.getMessage()
    const message_id = await s.getMessageID()

    // s.recallMessage(message_id)

    const collectedPath = path.join(__dirname, 'collected'); // 构建 collected 目录的完整路径  
    const srcs = fs.readdirSync(collectedPath).map(v => {
        return {
            src: v,
            items: fs.readdirSync(
                path.join(__dirname, `collected/${v}`)
            )
        }
    })

    let item = null // 目录对象
    let index = 0 // 随机图片起始序号
    if (param2 == "目录") {
        let msg = await s.reply(`随机图片：\n${srcs.map((v, i) => { return (i + 1) + '.' + v.src + '（' + v.items.length + '）' }).join('\n')}`)
        let select = await s.listen(timeout * 1000)

        s.recallMessage(msg)

        item = srcs[select - 1]
        src = item.src
    } else if (param2) {
        item = srcs.filter(v => { return new RegExp(param2).test(v.src) })[0]
        src = item.src
    } else {
        item = srcs.filter(v => { return new RegExp(src).test(v.src) })[0]
    }
    index = Math.floor(Math.random() * (item.items.length - pic_num))
    s.reply(`${src}：${index} - ${index + pic_num - 1}`)
    for (let i = index; i < index + pic_num; i++) {
        // const index_msg = await s.reply(i.toString())
        const img_path = path.join(__dirname, `collected/${src}/${item.items[i]}`)
        const img_url = await img2aut(img_path, username, password)
        s.reply(item.items[i])
        s.replyImage(img_url.result.path)
        await wait(delay * 1000)
        // s.recallMessage(index_msg)
    }
})()

// 函数实现，参数单位 毫秒 ；
function wait(ms) {
    return new Promise(resolve => setTimeout(() => resolve(), ms));
};

function img2aut(filePath, username, password) {
    var data = new FormData();
    // data.append('imgUrl', '');
    data.append('imgfile', fs.createReadStream(filePath));
    data.append('username', username);
    data.append('password', password);

    return axios({
        method: 'post',
        url: 'http://aut.zhelee.cn/imgUpload',
        headers: {
            // 'Authorization': 'Bearer 0cb972b0-516c-8c7a-8c95-955263eed4c1',
            'User-Agent': 'Apifox/1.0.0 (https://apifox.com)',
            ...data.getHeaders()
        },
        data: data
    }).then(function (response) {
        console.log(JSON.stringify(response.data));
        return response.data
    }).catch(function (error) {
        console.log(error);
    });
}
