//[author: jusbe]
// [title: 微信小程序]
// [class: 工具类]
// [version: 1.1.3 修复找不到jusapi]
// [price: 2]
// [rule: ^小程序(管理|.+)$]
// [rule: ^(管理|.+)?小程序$]
// [bypass: false]
// [priority: 1]
// [public: true]
// [admin: false]
// [disable:true]
// [platform: wx，仅限西瓜平台使用]
// [open_source: true]是否开源
// [imType: wx] 白名单
// [service: Jusbe]
// [description: 用于收集/发送小程序，配合“指令转换”功能跟随其他命令一起输出<br>命令：(管理)小程序, (关键词)小程序<br>首发：20240701<br><img src="https://bbs.autman.cn/assets/files/2024-07-01/1719826295-814876-1.jpg" alt="小程序1" /><img src="https://bbs.autman.cn/assets/files/2024-07-01/1719826295-837406-2.jpg" alt="小程序2" />]

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

    let vapps = JSON.parse(bucketGet("jusapi", "vapps") || "[]")
    if (param1 == "管理" || !param1) {
        let content = `${pluginName}
        ========================
        `+ vapps.map((v, i) => `【${i + 1}】${v.app_name}`).join("\n")
            + `
        ========================`
        if (isadmin) content += "\n》+ 添加    》- 删除"

        const select = inputReg(content.replace(/^\s+/img, ""), /^(\+)|(\-?\d+)$/i); if (!select) return select
        if (/^\d+$/.test(select)) {
            if (+select > vapps.length) return sendText("输入有误")
            const _vap = vapps[select - 1]
            const invite_link = _vap.data.replace("${timestamp}", Date.now())

            // {"Code":0,"Result":"OK"}
            // {"Code":-4,"Result":"参数填写有误"}
            if (xyos.SendXmlMsg(userid, invite_link).Code) return sendText("发送小程序失败")
        } else if (/^\+$/i.test(select) && isadmin) {
            let app_cfg = inputReg(pluginName + "\n========================\n请将小程序转发给我", /\<msg>[\S\s]+\<shareId\>.+\<\/shareId\>[\S\s]+\<\/msg\>/ig); if (!app_cfg) return app_cfg
            app_cfg = app_cfg.match(/\<msg>[\S\s]+\<shareId\>.+\<\/shareId\>[\S\s]+\<\/msg\>/ig)[0]
            app_cfg = app_cfg.replace(/[\r\n]\s*/ig, "").replace(/(?<=_)\d{10}(?=_)/, "${timestamp}")

            // let shareIdMatch = app_cfg.match(/<shareId>(.*?)<\/shareId>/);
            // shareIdMatch = shareIdMatch ? shareIdMatch[1].replace(/(?<=_)\d{10}(?=_)/, "${timestamp}") : undefined

            let appidMatch = app_cfg.match(/<appid>(.*?)<\/appid>/);
            appidMatch = appidMatch ? appidMatch[1] : undefined

            let sourcedisplaynameMatch = app_cfg.match(/<sourcedisplayname>(.*?)<\/sourcedisplayname>/);
            sourcedisplaynameMatch = sourcedisplaynameMatch ? sourcedisplaynameMatch[1] : undefined

            let appnameMatch = app_cfg.match(/<appname>(.*?)<\/appname>/);
            appnameMatch = appnameMatch ? appnameMatch[1] : undefined

            let fromusernameMatch = app_cfg.match(/<fromusername>(.*?)<\/fromusername>/);
            fromusernameMatch = fromusernameMatch ? fromusernameMatch[1] : undefined

            let _vap = vapps.find(v => v.app_id == appidMatch && v.from_user_name == fromusernameMatch)
            if (_vap) vapps = vapps.map(v => {
                if (v.app_id == appidMatch && v.from_user_name == fromusernameMatch)
                    v = {
                        ...v,
                        ...{
                            app_id: appidMatch ,
                            app_name: appnameMatch|| sourcedisplaynameMatch || "未知小程序",
                            from_user_name: fromusernameMatch,
                            data: app_cfg
                        }
                    }

                return v
            })
            else vapps.push({ app_id: appidMatch, app_name: appnameMatch|| sourcedisplaynameMatch || "未知小程序", from_user_name: fromusernameMatch, data: app_cfg })

            bucketSet("jusapi", "vapps", JSON.stringify(vapps))
            return sendText(`${_vap ? "更新" : "新增"}小程序: ${appnameMatch|| sourcedisplaynameMatch || "未知小程序"}`)
        } else if (/^\-\d+$/.test(select) && isadmin) {
            const index = select.slice(1) - 1

            sendText(`移除小程序: ${vapps[index].app_name}`)
            return bucketSet(
                "jusapi",
                "vapps",
                JSON.stringify(
                    vapps.filter((v, i) => i !== index)
                )
            )
        }
    } else {
        const _vap = vapps.find(v => v.app_name.includes(param1)); if (!_vap) return sendText("未找到小程序")
        const invite_link = _vap.data.replace("${timestamp}", Date.now())

        // {"Code":0,"Result":"OK"}
        // {"Code":-4,"Result":"参数填写有误"}
        if (xyos.SendXmlMsg(chatId ? `${chatId}@chatroom` : userid, invite_link).Code) return sendText("发送小程序失败")
    }
}

main()
Debug('================ End ================')