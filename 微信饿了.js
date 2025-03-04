//[author: jusbe]
//[title: 微信饿了]
//[language: nodejs]
//[class: 工具类]
//[service: Jusbe] 售后联系方式
//[disable:true] 禁用开关，true表示禁用，false表示可用
//[admin: true] 是否为管理员指令
//[rule: raw ^微信饿了$] 匹配规则，多个规则时向下依次写多个
//[rule: raw ^微信饿了(同步)$] 匹配规则，多个规则时向下依次写多个
//[priority: 1] 优先级，数字越大表示优先级越高
//[platform: all] 适用的平台
//[open_source: false]是否开源
//[icon: 图标url]图标链接地址，请使用48像素的正方形图标，支持http和https
//[version: 1.0.1]版本号
//[public: false] 是否发布？值为true或false，不设置则上传aut云时会自动设置为true，false时上传后不显示在市场中，但是搜索能搜索到，方便开发者测试
//[price: 2] 上架价格
//[description: 命令1:微信饿了 (可自定义)<br>命令2:微信饿了同步 (可自定义, 需包含(xx))<br><br>首发：20230612<br><img src="https://bbs.autman.cn/assets/files/2024-06-19/1718796984-163141-51.jpg" alt="51代理签到" />] 使用方法尽量写具体
// [param: {"required":true,"key":"elmt.ql_name","bool":false,"placeholder":"","name":"容器名称","desc":""}]
// [param: {"required":false,"key":"elmt.env_name","bool":false,"placeholder":"默认: elmck","name":"变量名称","desc":"暂不支持在“青龙-配置文件”中设置"}]
// [param: {"required":false,"key":"elmt.ownCookie_env","bool":false,"placeholder":"默认: ownCookie","name":"天天抽奖 变量名称","desc":"暂不支持在“青龙-配置文件”中设置"}]
// [param: {"required":false,"key":"elmt.ownCookie_uid","bool":false,"placeholder":"","name":"天天抽奖 车头USERID","desc":"同步 elmck 到 ownCookie"}]
// [param: {"required":false,"key":"elmt.pusher_token_env","bool":false,"placeholder":"默认: WX_PUSH_TOKEN","name":"wxpusher toekn<br>变量名称","desc":"暂不支持在“青龙-配置文件”中设置"}]
// [param: {"required":false,"key":"elmt.uid_key_name","bool":false,"placeholder":"默认: wxUid","name":"UID 键名","desc":""}]

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const middleware = require('./middleware.js');
const senderID = middleware.getSenderID();
const s = new middleware.Sender(senderID)

try {
    console.log(`加载 ${path.resolve("./jusapi.js")}`)
    var jusapi = require('./jusapi.js');
} catch (e) {
    // error: {code,message,stack,requireStack}
    console.error(e.message)
    if (e.message?.includes?.("Cannot find module './jusapi.js'")) {
        s.reply(`未找到 ${path.resolve("./jusapi.js")}, 尝试下载`)
            .then(() => {
                axios.get("https://raw.githubusercontent.com/iCouldFly/autman_plugins/scripts/jusapi.js", { responseType: 'stream' })
                    .then(({ status, statusText, headers, config, request, data }) => {
                        console.log(`jusapi 下载成功: ${status} - ${statusText}`)
                        const fileStream = fs.createWriteStream('./jusapi.js')
                        data.pipe(fileStream);

                        fileStream.on('finish', () => {
                            fileStream.close();
                            console.log(`jusapi 已保存到: ${path.resolve("./jusapi.js")}`);
                            s.reply("下载完成, 请重新发起命令").then(() => process.exit())
                        });
                    })
                    .catch(({ code, message, stack, name, config, request, constructor, toJSON }) => {
                        console.error(`jusapi 下载失败: [${name}]${code} - ${message}\n \n请手动下载文件并存放至: ${path.resolve("./jusapi.js")}\n\nhttps://raw.githubusercontent.com/iCouldFly/autman_plugins/scripts/jusapi.js`)
                        s.reply(`jusapi 下载失败: ${message}\n \n请手动下载文件并存放至: ${path.resolve("./jusapi.js")}\n\nhttps://raw.githubusercontent.com/iCouldFly/autman_plugins/scripts/jusapi.js`).then(() => process.exit())
                    })
            })
    } else s.reply(e.message.split("\n")[0]).then(() => process.exit())
}

jusapi &&
    !(async () => {
        // const is_admin = await s.isAdmin()
        // const plugin_name = await s.getPluginName()
        // const plugin_version = (await s.getPluginVersion()).match(/^[\d\.]+/)[0]
        // const user_avatar_url = await s.getUserAvatarUrl()
        // const username = await s.bucketGet("cloud", "username")
        // const password = await s.bucketGet("cloud", "password")
        const im = await s.getImtype()
        const user_id = await s.getUserID()
        // const user_name = await s.getUserName()
        // const group_name = await s.getGroupName()
        // const group_id = await s.getChatID()
        const param1 = await s.param(1)
        // const param2 = await s.param(2)
        // const param3 = await s.param(3)
        // const message = await s.getMessage()
        // const message_id = await s.getMessageID()

        const users = JSON.parse((await middleware.bucketGet("elmt", "users")) || "[]")
        const ql_name = await middleware.bucketGet("elmt", "ql_name")
        const env_name = (await middleware.bucketGet("elmt", "env_name") || "elmck")
        const pusher_token_env = (await middleware.bucketGet("elmt", "pusher_token_env") || "WX_PUSH_TOKEN")
        const uid_key_name = (await middleware.bucketGet("elmt", "uid_key_name") || "wxUid")
        const ql_cfg = await jusapi.getQLS(ql_name); if (!ql_cfg?.success) return s.reply(ql_cfg?.message)
        const ql = await new jusapi.QingLong(ql_cfg.data[0]); if (!ql?.success) return s.reply(ql?.message)


        if (param1) sync()
        else setUID()

        async function sync() {
            //******************************* wxUid 同步 *******************************//
            let all_env = await ql.getEnvs(); if (!all_env.success) return console.error(all_env.message)
            let wusers = users.filter(f => f.UID)

            for (let user of wusers) {
                let ims = Object.entries(user).filter(f => ["wx", "wb", "tg", "tb", "qq", "qb", "dc", "dd", "fs", "kk", "sk", "qh"].includes(f[0])).map(v => v[1])
                for (let i = 0; i < ims.length; i++) {
                    let imck = all_env.data.filter(f => f.remarks && f.remarks.includes(ims[i]))
                    imck.map(v => {
                        let _value = v.value.split(";").map(m => m.trim().split("=")).filter(f => f[0] && f[1]).reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
                        let elmuid = _value["USERID"]
                        _value[uid_key_name] = user.UID
                        _value = Object.entries(_value).map(([key, value]) => `${key}=${value}`).join(";")
                        v.value = _value
                        ql.putEnv(v)
                        console.log(`${elmuid} ${uid_key_name} 已同步`)
                    })
                }
            }

            //******************************* ownCookie 同步 *******************************//
            const ownCookie_env = (await middleware.bucketGet("elmt", "ownCookie_env")) || "ownCookie",
                ownCookie_uid = await middleware.bucketGet("elmt", "ownCookie_uid")
            if (!(ownCookie_env && ownCookie_uid)) return console.error("未设置 ownCookie_uid , 跳过")

            let mian_env = all_env.data.find(f => f.value.includes(ownCookie_uid)),
                own = all_env.data.find(f => f.name.includes(ownCookie_env))
            if (!mian_env) return console.log(`未找到 ${env_name}: ${ownCookie_uid}`)

            console.log(`已设置 ${ownCookie_env}: ${ownCookie_uid}, 尝试同步`)

            if (own) {
                console.log(`更新变量: ${ownCookie_env}`)
                own.value = mian_env.value; own.remarks = `饿了么天天抽奖 车头 ${ownCookie_uid}`; ql.putEnv(own)
            }
            else {
                console.log(`新建变量: ${ownCookie_env}`)
                own = ql.createEnvs(ownCookie_env, mian_env.value, `饿了么天天抽奖 车头 ${ownCookie_uid}`)
            }
            console.log(`${ownCookie_env} 同步完成`)
        }

        async function setUID() {
            const WX_PUSH_TOKEN = (await ql.getEnvs(pusher_token_env))?.data?.[0]?.value; if (!WX_PUSH_TOKEN) return s.reply("未找到 WX_PUSH_TOKEN")
            const wxpusher = new jusapi.WxPusher(WX_PUSH_TOKEN);

            let user = users.find(f => f[im] == user_id);
            if (user && user.UID) s.reply(`🎉 您已设置 UID：\n${user.UID}\n \n如需更改请扫码登记`)
            else s.reply("❌ 您还未设置 UID\n请扫码登记")
            return wxpusher.getUID()
                .then(({ message, success, code, data }) => {
                    if (!success || !data) return s.reply(message)

                    if (success) {
                        s.reply(`扫描成功，UID: ${data}`)

                        // im 已存在，更新 UID
                        if (user) user.UID = data
                        // im 不存在 ...
                        else {
                            user = users.find(f => f.UID == data)

                            // UID 已存在，更新 im
                            if (user) user[im] = user_id
                            // UID 不存在，新增用户
                            else users.push([[im, user_id], ["UID", data]].reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {}))
                        }
                        middleware.bucketSet("elmt", "users", JSON.stringify(users))
                    } else {
                        s.reply(`扫描失败: ${message}`)
                    }
                })
                .catch(e => {
                    return s.reply("获取 UID 失败")
                })
        }
    })()