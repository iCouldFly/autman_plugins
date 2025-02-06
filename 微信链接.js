//[author: jusbe]
// [title: 微信链接]
// [class: 工具类]
// [version: 1.0.1 修复找不到jusapi]
// [price: 2]
// [rule: ^(管理|.+)?链接$]
// [bypass: false]
// [priority: 1]
// [public: true]
// [admin: false]
// [disable:true]
// [platform: wx，仅限西瓜平台使用]
// [imType: wx] 白名单
// [open_source: true]是否开源
// [service: Jusbe]
// [description: 用于收集/发送微信链接，配合“指令转换”功能跟随其他命令一起输出<br>命令：管理链接, (关键词)微信链接<br>首发：20240701<br><img src="https://bbs.autman.cn/assets/files/2024-07-31/1722389086-475021-1.jpg" alt="微信链接" /><img src="https://bbs.autman.cn/assets/files/2024-07-31/1722389086-492000-2.jpg" alt="微信链接" />]

const pluginName = getTitle()
const userid = GetUserID()
const chatId = GetChatID()
const param1 = param(1);
const isadmin = isAdmin()
// const content = GetContent()
Debug(`<div style="text-align: center; font-size: 72px; font-weight: bold;">${pluginName}</div>`)

try {
    importJs('jusapi.js')
    Debug("加载旧板 jusapi")
} catch (e) {
    Debug("未找到旧板 jusapi ，尝试查找新版")
    try {
        importJs('jusbe:jusapi.js')
        Debug("新版 jusapi 加载成功")
    } catch (e) {
        Debug("新版也没找到")
        throw new Error('请在插件市场安装“jusapi”');
    }
}

const xyo_host = bucketGet("wx", "vlw_addr")
const xyo_token = bucketGet("wx", "vlw_token")
const robot_wxid = bucketGet("wx", "robot_wxid")
const xyos = new xyo(xyo_host, xyo_token, robot_wxid);

function main() {
    if (!(xyos.success)) return sendErr("本插件仅支持xyo使用")

    let vlinks = JSON.parse(bucketGet("jusapi", "vlinks") || "[]")
    if (param1 == "管理" || !param1) {
        let content = `${pluginName}
        ========================
        `+ vlinks.map((v, i) => `【${i + 1}】${v.appname||v.title.slice(0, 14)}`).join("\n")
            + `
        ========================`
        if (isadmin) content += "》+ 添加    》- 删除"

        const select = inputReg(content.replace(/^\s+/img, ""), /^(\+)|(\-?\d+)$/i); if (!select) return select
        if (/^\d+$/.test(select)) {
            if (+select > vlinks.length) return sendText("输入有误")
            const _vap = vlinks[select - 1]
            const invite_link = _vap.data.replace("${timestamp}", Date.now())

            if (xyos.SendLinkMsg(chatId ? `${chatId}@chatroom` : userid, invite_link).Code) return sendText("发送微信链接失败")
        } else if (/^\+$/i.test(select) && isadmin) {
            let app_cfg = inputReg(pluginName + "\n========================\n请将微信链接转发给我", /\<msg>[\S\s]+\<url\>.+\<\/url\>[\S\s]+\<\/msg\>/ig); if (!app_cfg) return app_cfg
            app_cfg = app_cfg.match(/\<msg>[\S\s]+\<url\>.+\<\/url\>[\S\s]+\<\/msg\>/ig)[0]
            app_cfg = app_cfg.replace(/[\r\n]\s*/ig, "").replace(/(?<=_)\d{10}(?=_)/, "${timestamp}")

            let urlMatch = app_cfg.match(/<url>(.*?)<\/url>/i); if (!urlMatch) return sendErr("读取链接失败")
            rebug(`urlMatch: ${urlMatch}`, 1)
            urlMatch = urlMatch[1]

            let urlCheck = urlMatch.match(/^https?\:\/\/[^\.]+(\.[^\.\/]+)+\/([^\/\?]*)/img); if (!urlMatch) return sendErr("读取链接失败")
            rebug(`urlCheck: ${urlCheck}`, 1)
            urlCheck = urlCheck[0]

            let titleMatch = app_cfg.match(/<title>(.*?)<\/title>/);
            titleMatch = titleMatch ? titleMatch[1] : undefined
          
            let appnameMatch = app_cfg.match(/<appname>(.*?)<\/appname>/);
            appnameMatch = appnameMatch ? appnameMatch[1] : ""

            let _vap = vlinks.find(v => v.url.includes(urlCheck))
            if (_vap) vlinks = vlinks.map(v => {
                if (v.url.includes(urlCheck))
                    v = {
                        ...v,
                        ...{
                            url: urlMatch,
                            title: titleMatch,
                          appname:appnameMatch,
                            data: app_cfg
                        }
                    }

                return v
            })
            else vlinks.push({ url: urlMatch, title: titleMatch,appname:appnameMatch, data: app_cfg })

            bucketSet("jusapi", "vlinks", JSON.stringify(vlinks))
            return sendText(`${_vap ? "更新" : "新增"}微信链接: ${appnameMatch||titleMatch}`)
        } else if (/^\-\d+$/.test(select) && isadmin) {
            const index = select.slice(1) - 1

            sendText(`移除微信链接: ${vlinks[index].appname||vlinks[index].title}`)
            return bucketSet(
                "jusapi",
                "vlinks",
                JSON.stringify(
                    vlinks.filter((v, i) => i !== index)
                )
            )
        }
    } else {
        const _vap = vlinks.find(v =>v.appname.includes(param1) || v.title.includes(param1)); if (!_vap) return rebug("未找到微信链接")
        const invite_link = _vap.data.replace("${timestamp}", Date.now())

        if (xyos.SendLinkMsg(chatId ? `${chatId}@chatroom` : userid, invite_link).Code) return sendText("发送微信链接失败")
    }
}

main()
Debug('================ End ================')