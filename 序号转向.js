//[title: 序号转向]
//[language: nodejs]
//[class: 工具类]
//[service: jusbe] 售后联系方式
//[disable: false] 禁用开关，true表示禁用，false表示可用
//[admin: false] 是否为管理员指令
//[rule: raw 序号(转|反)向] 匹配规则，多个规则时向下依次写多个
//[priority: 1] 优先级，数字越大表示优先级越高
//[platform: all] 适用的平台
//[open_source: true]是否开源
//[icon: 图标url]图标链接地址，请使用48像素的正方形图标，支持http和https
//[version: 1.0.0]版本号
//[public: true] 是否发布？值为true或false，不设置则上传aut云时会自动设置为true，false时上传后不显示在市场中，但是搜索能搜索到，方便开发者测试
//[price: 2] 上架价格
//[description: 关于插件的描述] 使用方法尽量写具体

const fs = require('fs');

const middleware = require('./middleware.js');
const senderID = middleware.getSenderID();
const s = new middleware.Sender(senderID)

try {
    var jusapi = require("./jusapi.js")
} catch (e) {
    if (e.code === "MODULE_NOT_FOUND") {
        s.reply("未找到 jusapi，尝试自动下载")
        fetch("https://raw.githubusercontent.com/iCouldFly/autman_plugins/refs/heads/scripts/jusapi.js")
            .then(d => d.text())
            .then(d => {
                if (d.includes("title: jusapi")) {
                    fs.writeFile("./jusapi.js", d, ((err, written) => {
                        if (err) {
                            s.reply("jusapi 下载失败") //.then(() => process.exit())
                            s.reply(err)
                            s.reply(written).then(() => process.exit())
                            // process.exit()
                        } else {
                            s.reply("jusapi 下载完成，请重新发起命令").then(() => process.exit())
                        }
                    }))
                } else {
                    s.reply("jusapi 下载错误").then(() => process.exit())
                }
            })
            .catch(e => {
                // {"cause":{"errno":-4077,"code":"ECONNRESET","syscall":"read"}}
                // {"cause":{"name":"ConnectTimeoutError","code":"UND_ERR_CONNECT_TIMEOUT","message":"Connect Timeout Error"}}
                s.reply("jusapi 下载失败\n" + JSON.stringify(e)).then(() => process.exit())
            })
    } else {
        s.reply("jusapi 加载失败").then(() => process.exit())
    }
}

jusapi &&
    !(async () => {
        // const is_admin = await s.isAdmin()
        // const plugin_name = await s.getPluginName()
        // const plugin_version = await s.getPluginVersion()
        // const user_avatar_url = await s.getUserAvatarUrl()
        // const username = await s.bucketGet("cloud", "username")
        // const password = await s.bucketGet("cloud", "password")
        // const im = await s.getImtype()
        // const user_id = await s.getUserID()
        // const user_name = await s.getUserName()
        // const group_name = await s.getGroupName()
        // const group_id = await s.getChatID()
        // const param1 = await s.param(1)
        // const param2 = await s.param(2)
        // const param3 = await s.param(3)
        // const message = await s.getMessage()
        // const message_id = await s.getMessageID()

        const input = await jusapi.inputReg("请输入内容：").then(({ success, data }) => success ? data : process.exit())
        const dataAry = input.replace(/[\r\n]+/g, "\n").split("\n")

        if (/^\d+/.test(dataAry[0])) {
            s.reply(dataAry.map(m => m.replace(/^(\d+)([\s\=\-]*)(.+?)$/mg, "$3$2$1")).join("\n"))
        } else if (/\d+$/.test(dataAry[0])) {
            s.reply(dataAry.map(m => m.replace(/^(.+?)([\s\=\-]*)(\d+)$/mg, "$3$2$1")).join("\n"))
        }
        s.reply(dataAry.reverse().join("\n"))
    })()
