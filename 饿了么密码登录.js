//[author: jusbe]
//[title: 饿了么密码登录]
//[language: nodejs]
//[class: 工具类]
//[service: Jusbe] 售后联系方式
//[cron: 33 * * * *]
//[disable:true] 禁用开关，true表示禁用，false表示可用
//[admin: false] 是否为管理员指令
//[rule: raw ^饿了账密$] 匹配规则，多个规则时向下依次写多个
//[rule: raw ^饿了账密同步$] 匹配规则，多个规则时向下依次写多个
//[priority: 1] 优先级，数字越大表示优先级越高
//[platform: all] 适用的平台
//[open_source: false]是否开源
//[icon: 图标url]图标链接地址，请使用48像素的正方形图标，支持http和https
//[version: 1.0.0]版本号
//[public: false] 是否发布？值为true或false，不设置则上传aut云时会自动设置为true，false时上传后不显示在市场中，但是搜索能搜索到，方便开发者测试
//[price: 2] 上架价格
//[description: 说明》插件仅用于登记账号到ck中，不会执行脚本。插件定时比脚本定时早几秒，或任意定时<br>命令1》饿了账密(可自定义)<br><br>首发：20241012] 使用方法尽量写具体

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
        const is_admin = await s.isAdmin()
        const admin_icon = is_admin ? "🐮" : "👤"
        const plugin_name = await s.getPluginName()
        const plugin_version = (await s.getPluginVersion()).match(/^[\d\.]+/)[0]
        const separator_symbol = (await middleware.bucketGet("jusapi", "separator")) || "="
        const separator_width = (await middleware.bucketGet("jusapi", "separator_width")) || 23
        const separator = separator_symbol.repeat(separator_width)
        const title = `${admin_icon} ${plugin_name} v${plugin_version}\n${separator}`
        // const user_avatar_url = await s.getUserAvatarUrl()
        // const username = await s.bucketGet("cloud", "username")
        // const password = await s.bucketGet("cloud", "password")
        const im = await s.getImtype()
        const user_id = await s.getUserID()
        // const user_name = await s.getUserName()
        // const group_name = await s.getGroupName()
        // const group_id = await s.getChatID()
        // const param1 = await s.param(1)
        // const param2 = await s.param(2)
        // const param3 = await s.param(3)
        const message = await s.getMessage()
        // const message_id = await s.getMessageID()
        const { inputReg, rebug, sleep, getQLS, QingLong, sendNotify } = jusapi
        // let try_time = 60, wait_time = 5

        const qs = require('qs')
        const elmt_pws = JSON.parse((await middleware.bucketGet("elmt", "pws")) || "[]")

        // 青龙连接
        const ql_cfg = (await middleware.bucketGet("Yzyxmm_elm", "elm_Qinglong")) || await s.reply("请检查插件的容器配置").then(() => process.exit())
        const [ql_host, ql_ClientID, ql_ClientSecret] = ql_cfg.split("丨")
        const ql = await new QingLong(ql_host, ql_ClientID, ql_ClientSecret); ql.success || await s.reply(ql.message || `容器连接失败: ${ql_host}`).then(() => process.exit())
        console.log(`容器连接成功: ${ql_host}`)

        // 定时同步
        if (im == "fake" || im == "fk" || message == "饿了账密同步") {
            for (let { USERID, loginId, password } of elmt_pws) {
                await ql
                    .getEnvs(USERID)
                    .then(async ({ success, data, message }) => success ?
                        data
                            .filter(f => f.name == "elmck")
                            .map(_env => {
                                _env.value = qs.parse(_env.value.replace(/\;\s?/g, "&"))
                                _env.value["loginId"] = loginId
                                _env.value["password"] = password
                                _env.value = Object.entries(_env.value).map(([key, value]) => `${key}=${value}`).join("; ") + ";"

                                console.log("同步账号:", USERID, loginId, password)
                                ql.putEnv(_env)
                            }) :
                        console.error(`${USERID} 读取变量失败: ${message}`))
            }
            return
        }


        // 读取用户账号信息
        let uinfo = eval(await middleware.bucketGet("Yzyxmm_elm_bind", user_id) || "[]") // 获取 USERID 列表
            .map(v => ({ "USERID": v }))

        uinfo = await Promise.all(
            uinfo.map(async v => {
                v["phone"] = await middleware.bucketGet("Yzyxmm_elm_phone", v["USERID"]) // 获取 USERID 对应手机号
                v["env"] = await ql.getEnvs(v["USERID"]).then(async ({ success, data, message }) => success ? data.find(f => f.name == "elmck") : await s.reply(message).then(() => process.exit()))

                const _lp = elmt_pws.find(f => f?.["USERID"] == v["USERID"])
                v["loginId"] = _lp?.loginId
                v["password"] = _lp?.password

                // v["cookie"] = await middleware.bucketGet("Yzyxmm_elm_account", v["USERID"]) // 获取 USERID 对应 cookie

                // let { loginId, password } = qs.parse(v["cookie"].replace(/\;\s?/g, "&"))
                // v["loginId"] = loginId // 获取 USERID 对应 账号
                // v["password"] = password // 获取 USERID 对应 密码

                return v
            })
        )

        // 主菜单
        await inputReg(`${title}\n` + uinfo.map((v, i) => `${v.loginId && v.password ? "✅" : "❌"}【${i + 1}】${v.phone}`).join("\n") + `\n${separator}\n请选择要登记/修改的账号\n如果上面没有您要登记的账号。请退出后发直接发 cookie 给我，再发进行登记》q 退出`, /^\d+$/)
            .then(async ({ success, message, data }) => {
                success || await s.reply(message).then(() => process.exit())

                let _item = uinfo?.[data - 1] || await s.reply("选择错误").then(() => process.exit())

                await inputReg(`${title}\nI D: ${_item.USERID}\n账号: ${_item?.loginId?.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') || ""}\n密码: ${_item.password ? "***" : "/"}\n${separator}\n如需更新请将上面的内容修改后发给我（q 退出）`)
                    .then(async ({ success, message, data }) => {
                        success || await s.reply(message).then(() => process.exit())

                        let _loginid = data.match(/账号:.+/mg)?.[0]?.split(":")?.[1]?.trim()
                        let _password = data.match(/密码:.+/mg)?.[0]?.split(":")?.[1]?.trim()
                        _loginid && _password || await s.reply("输入错误").then(() => process.exit())

                        let _lp = elmt_pws.find(f => f?.["USERID"] == _item["USERID"])
                        if (!_lp) { elmt_pws.push({ "USERID": _item["USERID"] }); _lp = elmt_pws.find(f => f?.["USERID"] == _item["USERID"]) }

                        _lp["loginId"] = _loginid
                        _lp["password"] = _password
                        middleware.bucketSet("elmt", "pws", JSON.stringify(elmt_pws))
                        s.reply("登记成功")
                    })
            })
    })()