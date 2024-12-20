// [description: <a href="https://docs.qq.com/doc/DUHNWRkpQRGZDeml5" title="by justore">查看文档</a><br>RabbitPro 扫码/口令/短信登录<br>首发：20231001]
// [title: RabbitPro]
// [class: 工具类]
// [version: 3.16.0 下架及开源（github）]
// [price: 2]
// [rule: ^登录$]
// [rule: ^登陆$]
// [bypass: false]
// [priority: 1]
// [public: true]
// [open_source: true]
// [admin: false]
// [disable:false]
// [service: Jusbe]
// [author: jusbe]
// [platform: ALL]
// [param: {"required":true,"key":"RabbitPro.host","bool":false,"placeholder":"如：http://127.0.0.1:5701","name":"RabbitPro 地址","desc":"RabbitPro 的地址"}]
// [param: {"required":true,"key":"RabbitPro.container_name","bool":false,"placeholder":"如：🐇京东上车服务器","name":"RabbitPro 容器","desc":"RabbitPro 中的容器名称<br>使用 Bot 容器请自行配置同步模式/规则"}]
// [param: {"required":true,"key":"RabbitPro.username","bool":false,"placeholder":"如：admin","name":"管理员账号","desc":""}]
// [param: {"required":true,"key":"RabbitPro.password","bool":false,"placeholder":"如：123456","name":"管理员密码","desc":""}]
// [param: {"required":false,"key":"RabbitPro.appToken","bool":false,"placeholder":"如：AT_abcdefg....xyz","name":"wxpusher appToken","desc":"用于微信推送，留空则不启用"}]
// [param: {"required":false,"key":"RabbitPro.title","bool":false,"placeholder":"","name":"顶部标题","desc":"默认使用 RabbitPro 的容器名称"}]
// [param: {"required":false,"key":"RabbitPro.announcement","bool":false,"placeholder":"","name":"底部提示","desc":"默认使用 RabbitPro 的公告内容，支持“一言,笑话,情话,骚话,英文”"}]
// [param: {"required":false,"key":"RabbitPro.expired","bool":false,"placeholder":"","name":"召唤内容","desc":"默认使用 RabbitPro 的过期通知"}]
// [param: {"required":false,"key":"RabbitPro.web","bool":false,"placeholder":"http ...","name":"网页地址","desc":"在主菜单中显示网页登录地址"}]
// [param: {"required":false,"key":"RabbitPro.nothifies","bool":false,"placeholder":"如：qqindiv:123,qqgroup:456,wxgroup:789,tbgroup:111,qbgroup:333","name":"额外通知","desc":"（此功能未开放）留空默认仅通知管理员结果</br>格式：qqindiv:123,qqgroup:456,wxgroup:789"}]
// [param: {"required":false,"key":"RabbitPro.qr_func","bool":false,"placeholder":"默认: 0","name":"取码方式","desc":"目前有 0-2 ，不出码时尝试更改此项"}]

Debug('\n\n\n\n\n<div style="text-align: center; font-size: 72px; font-weight: bold;">RabbitPro</div>')

const errTime = 6
const inputTime = 60
const recallTime = 60
const timeout = 90
const isDebug = bucketGet('jusapi', 'isDebug') //开启调试内容

const imType = GetImType()
const userId = GetUserID()
const isadmin = isAdmin()
const chatId = GetChatID()
const pluginName = getTitle()
const autHost = bucketGet('RabbitPro', 'autHost');
let web = bucketGet('RabbitPro', 'web'),
    qr_func = bucketGet("RabbitPro", "qr_func") || 0
// Debug(`autman地址：${bucketGet('autMan','host_name')}`)

function main() {
    let container_name = bucketGet('RabbitPro', 'container_name');
    if (!container_name || container_name == '') return sendErr('未配置容器')

    const rabbit = new RabbitPro();if(!rabbit?.config)return sendErr("RabbitPro 连接失败")
    const appToken = rabbit?.config?.WXPUSHER_APP_TOKEN
    const container = rabbit.getContainerByName(container_name); if (!container) return false
    if (container_name == 'Bot') Debug('使用 Bot 容器，请自行在 RabbitPro 后台配置CK同步规则')
    // Debug(JSON.stringify(rabbit.botQR()))
    let title = bucketGet('RabbitPro', 'title'); if (!title) title = container.name;
    let announcement = bucketGet('RabbitPro', 'announcement'); if (!announcement) announcement = '🔔公告：' + rabbit.getAnnouncement();
    if (/一言|笑话|情话|骚话|英文/.test(announcement)) {
        switch (announcement) {
            case "一言":
                announcement = "📄一言：" + request({ url: "https://api.vvhan.com/api/ian/rand", method: "get" })
                break
            case "笑话":
                announcement = "🎊笑话：" + request({ url: "https://api.vvhan.com/api/text/joke", method: "get" })
                break
            case "情话":
                announcement = "🎈情话：" + request({ url: "https://api.vvhan.com/api/text/love", method: "get" })
                break
            case "骚话":
                announcement = "🎉骚话：" + request({ url: "https://api.vvhan.com/api/text/sexy", method: "get" })
                break
            case "英文":
                announcement = "📜一言：" + request({ url: "https://api.vvhan.com/api/dailyEnglish", method: "get", json: true }).data.en
                break
        }
    }

    const user_uid = getWxPusherByIM()

    //版本更新通知✅❌
    /**
3.15.3
修复配参不显示问题
增加配参设置取码方式，出码异常时尝试更改此项
     */
   // if (isadmin && chatId == 0) {
       // const version = bucketGet("RabbitPro", "version")
      //  const now = getVersion()
      //  if (now != version) {
           // sendText(`RabbitPro v${now}\n\n⒈ ...`)
          //  bucketSet("RabbitPro", "version", now)
      //  }
  //  }

    //定时任务
    if (imType == 'fake') {
        Debug('=====================================')
        Debug('召唤前检测')
        rabbit.containers
            .filter(v => Boolean(v.id - 1) && v.status) // 排除 bot 容器 & 禁用容器
            .forEach((item, index) => Debug(`\n[${index + 1}]${item.name}：转换${rabbit.container_update_all(item.id) ? '✅成功' : '❌失败'}`))
        // .forEach((item, index) => Debug(`\n[${index + 1}]${item.name}：转换${item.status ? rabbit.container_update_all(item.id) ? '✅成功' : '❌失败' : '❌已禁用'}`))
        sleep(60000)

        Debug('定时召唤')
        const ids = new Array()
        rabbit.containers
            .filter(v => {
                if (v.status) return true
                else return Debug(`${v.name}: 容器已禁用，跳过`)
            })
            .forEach(item => {
                const dis_cks = rabbit.getCksByContainer(item.id).filter(v => {
                    return !(v.appck_status || v.mck_status || v.wskey_status)
                })

                dis_cks.forEach(element => {
                    if (!ids.includes(element.pin)) ids.push(element.pin)
                })

                Debug(`[${item.name}]容器找到失效CK：${dis_cks.length} 个${dis_cks.length == 0 ? '，跳过' : ''}`)
            })
        Debug(`所有容器找到 ${ids.length} 个失效CK`)
        ids.forEach(v => { Debug(v) })
        // \n${ids.join('\n')}

        let expired_html = bucketGet("RabbitPro", "expired")
        expired_html = expired_html ? expired_html : rabbit.get_expired_html()
        // {{ pin }}

        const pins = summon(ids, expired_html, '{{ pin }}')

        return notifyMasters(`【${pluginName}】定时召唤结束` + (pins.length ? '：\n' + pins.join('\n') : '：无召唤目标'))
    }

    // 长辈模式
    if (user_uid.phone != '' && user_uid.phone != undefined) {
        Debug(`长辈模式：${user_uid.phone.replace(/(?<=^\d{3})\d{4}/, '****')}，在数据通删除手机号可退出此模式`)
        const tip = sendText(`正在使用 ${user_uid.phone.replace(/(?<=^\d{3})\d{4}/, '****')} 登录京东，请稍等...\n \n${announcement}`)
        const sms_end = rabbit.signInBySMS(container.id, user_uid.phone)
        Debug(`长辈模式：${sms_end.success ? "成功" : "失败"}`)
        if (sms_end.success) {
            sendRecall(`${sms_end.pin} ${sms_end.message}`)
            return RecallMessage(tip)
        } else {
            sendRecall(`${sms_end.message}`)
            return RecallMessage(tip)
        }
    }

    // 普通模式
    let main_str = `${title}${isadmin && chatId == 0 ? '（e1 修改）' : ''}`
    main_str += '\n（请选择登录方式，q 退出）：\n'
    main_str += '=====================\n'
    main_str += '【1】扫码登录\n'
    main_str += '【2】口令登录\n'
    main_str += '【3】短信登录\n'
    main_str += '【4】长辈模式\n'
    if (web) main_str += '【5】网页登录\n'
    main_str += '=====================\n'
    if (appToken) main_str += user_uid.uid ? '🎉推送：已设置（w 修改）\n' : '❌微信推送：未设置（w 设置）\n'
    main_str += `${announcement}${isadmin && chatId == 0 ? '（e2 修改）' : ''}`
    if (isadmin && chatId == 0) {
        main_str += '\n~~~~~~~~~~~~~~~~~~~~~'
        main_str += `\n${rabbit.name}：v${rabbit.version}`
        if (rabbit.version != rabbit.new_version && rabbit.new_version != undefined) main_str += `\n（最新版：${rabbit.new_version}，u 更新）`
        if (imType != 'qb') main_str += `\n✅容器：${rabbit.host}`
        if (imType != 'qb') main_str += `\n${rabbit.admin_TestServerHost(rabbit.config.ServerHost) ? '✅' : '❌'}鉴权：${rabbit.config.ServerHost}`
        main_str += '\n~~~~~~~~~~~~~~~~~~~~~'
        main_str += `\n容器列表（${['车头模式', '传统模式', '分配模式', '随机容器'][rabbit.config.mode - 1]}）：`
        main_str += `\n${rabbit.containers.map((v, i) => { return `》b${i + 1} ${v.status ? v.name == container_name ? '🎯' : '⭕' : '❌'}${v.name}（${rabbit.getCksByContainer(v.id).filter(a => { return a.appck_status || a.mck_status || a.wskey_status }).length}/${rabbit.getCksByContainer(v.id).length}）` }).join('\n')}`
        main_str += '\n~~~~~~~~~~~~~~~~~~~~~'
        main_str += '\n》f 转换     》c 清理     》z 召唤\n》s 配置     》r 重启     》h 帮助'
        // Debug(JSON.stringify(rabbit.getCksByContainer(2)))
    }

    const select = ShuRu(main_str)
    if (select == 1) { // 【1】扫码登录
        Debug('用户选择扫码登录')
        const qr_end = rabbit.signInByQRCode(container.id)
        Debug(`【1】扫码登录：${qr_end.msg}，${qr_end.pin}`)
        if (qr_end == false) return false


        if (user_uid.uid) {
            sendRecall(`${qr_end.pin} ${qr_end.msg}`)
            Debug(`已存在uuid，将同步到RabbitPro：${user_uid.uid}`)
            return rabbit.setCkByPin(container.id, qr_end.pin, 'uuid', user_uid.uid)
        } else if (appToken) {
            const msg_1 = sendText(`${qr_end.pin} ${qr_end.msg}`)
            const uid = getWxPusher(appToken)
            if (!uid) return false

            const status = rabbit.setCkByPin(container.id, qr_end.pin, 'uuid', uid)
            RecallMessage(msg_1)
            return status ? sendRecall(uid + ' 设置成功！') : sendErr(uid + ' 设置失败')
        } else {
            sendRecall(`${qr_end.pin} ${qr_end.msg}`)
        }
    } else if (select == 2) { // 【2】口令登录
        const msg_end = rabbit.signInByQRMsg(container.id)
        Debug(`【2】口令登录：${msg_end.msg}，${msg_end.pin}`)
        if (msg_end == false) return false

        if (user_uid.uid) {
            sendRecall(`${msg_end.pin} ${msg_end.msg}`)
            Debug(`已存在uuid，将同步到RabbitPro：${user_uid.uid}`)
            return rabbit.setCkByPin(container.id, msg_end.pin, 'uuid', user_uid.uid)
        } else if (appToken) {
            const msg_1 = sendText(`${msg_end.pin} ${msg_end.msg}`)

            const uid = getWxPusher(appToken)
            if (!uid) return false

            const status = rabbit.setCkByPin(container.id, msg_end.pin, 'uuid', uid)
            RecallMessage(msg_1)
            return status ? sendRecall(uid + ' 设置成功！') : sendErr(uid + ' 设置失败')
        } else {
            sendRecall(`${msg_end.pin} ${msg_end.msg}`)
        }
    } else if (select == 3) { // 【3】短信登录
        const sms_end = rabbit.signInBySMS(container.id)
        Debug(`【3】短信登录：${sms_end.success ? "成功" : "失败"}`)
        if (sms_end.success == false) return sendErr(sms_end.message)

        if (user_uid.uid) {
            sendRecall(`${sms_end.pin} ${sms_end.message}`)
            Debug(`已存在uuid，将同步到RabbitPro：${user_uid.uid}`)
            return rabbit.setCkByPin(container.id, sms_end.pin, 'uuid', user_uid.uid)
        } else if (appToken) {
            const msg_1 = sendText(`${sms_end.pin} ${sms_end.message}`)

            const uid = getWxPusher(appToken)
            if (!uid) return false

            const status = rabbit.setCkByPin(container.id, sms_end.pin, 'uuid', uid)
            RecallMessage(msg_1)
            return status ? sendRecall(uid + ' 设置成功！') : sendErr(uid + ' 设置失败')
        } else {
            sendRecall(`${sms_end.pin} ${sms_end.message}`)
        }
    } else if (select == 4) { // 【4】长辈模式
        const tip = sendText('此模式为短信登录\n如登录成功，后续给我发登录将不再显示主菜单，直接使用短信登录')
        const sms_end = rabbit.signInBySMS(container.id)
        Debug(`【4】长辈模式：${sms_end.success ? "成功" : "失败"}`)
        if (sms_end.success == false) return sendErr(sms_end.message)
        RecallMessage(tip)

        //存储手机号
        const bucket_str = bucketGet('RabbitPro', 'uids')
        const bucket_data = JSON.parse(bucket_str)
        let isFind = false
        const new_data = bucket_data.map(
            item => {
                if (item[imType] == userId) {
                    item.phone = sms_end.phone
                    isFind = true
                }
                return item
            }
        )
        if (isFind == false) {
            const obj = new Object()
            obj[imType] = userId
            obj.phone = sms_end.phone
            new_data.push(obj)
        }
        bucketSet('RabbitPro', 'uids', JSON.stringify(new_data))

        //
        if (user_uid.uid) {
            sendRecall(`${sms_end.pin} ${sms_end.message}`)
            Debug(`已存在uuid，将同步到RabbitPro：${user_uid.uid}`)
            return rabbit.setCkByPin(container.id, sms_end.pin, 'uuid', user_uid.uid)
        } else if (appToken) {
            const msg_1 = sendText(`${sms_end.pin} ${sms_end.message}`)

            const uid = getWxPusher(appToken)
            if (!uid) return false

            const status = rabbit.setCkByPin(container.id, sms_end.pin, 'uuid', uid)
            RecallMessage(msg_1)
            return status ? sendRecall(uid + ' 设置成功！') : sendErr(uid + ' 设置失败')
        } else {
            sendRecall(`${sms_end.pin} ${sms_end.message}`)
        }
    } else if (select == 5 && web) { // 【5】网页登录
        let cpr = web.match(/(?<=%cpolar\.)(\w+?)(?=%)/img) || new Array()
        if (cpr.length) {
            let cpr_data = JSON.parse(bucketGet("cpolar", "data")) || new Array()
            cpr = cpr.forEach(v => {
                let searchValue = `%cpolar.${v}%`
                let replaceValue = cpr_data.filter(a => { return new RegExp(v, "img").test(a.name) })[0].public_url

                web = web.replace(searchValue, replaceValue)
            })
        }
        Debug(`【5】网页登录：${web}`)
        let msg_5 = `网页登录地址${isadmin && chatId == 0 ? "（e 修改）" : ""}：\n${web}`

        if (isadmin && chatId == 0) {
            let web_edit = ShuRu(msg_5)
            if (/^[eE]$/.test(web_edit)) {
                Debug('=====================================')
                Debug('修改网页登录地址')
                return context_set("网页登录地址", "web")
            }
        } else {
            sendRecall(msg_5)
        }
    } else if (/^[wW]$/.test(select)) { // 设置UID
        Debug('用户选择设置wxpusher')
        if (!appToken) return sendErr('未开启微信推送功能')
        const uid = getWxPusher(appToken)
        if (!uid) return false
        return sendRecall(uid + ' 设置成功！')
    } else if (/^[eE]1$/.test(select) && isadmin && chatId == 0) { // 修改标题
        Debug('=====================================')
        Debug('修改标题')
        return context_set("标题", "title")
    } else if (/^[eE]2$/.test(select) && isadmin && chatId == 0) { // 修改公告
        Debug('=====================================')
        Debug('修改公告')
        return context_set("公告", "announcement")
    } else if (/^[eE]3$/.test(select) && isadmin && chatId == 0) { // 修改召唤内容
        Debug('=====================================')
        Debug('修改召唤内容')
        return context_set("召唤内容", "expired")
    } else if (/^[bB]\d+$/.test(select) && isadmin && chatId == 0) { // 容器管理
        const index = /(?<=^[bB])\d+$/.exec(select)
        Debug('=====================================')
        Debug('容器管理' + index)
        if (index > rabbit.containers.length) return sendErr('输入有误')
        const container = rabbit.containers[index - 1]
        // Debug(JSON.stringify(container))

        let container_config_msg = '容器管理\n'
        container_config_msg += '=====================\n'
        container_config_msg += `⒈容器名称：${container.name}\n`
        container_config_msg += `⒉容器类型：${container.ServerType}\n`
        container_config_msg += `⒊容器地址：${container.url}\n`
        container_config_msg += `⒋Client Id：${container.client_id.replace(/(?<=.{4}).+(?=.{4})/, '****')}\n`
        container_config_msg += `⒌Client Secret：${container.client_secret.replace(/(?<=.{4}).+(?=.{4})/, '****')}\n`
        container_config_msg += `⒍WxPusher：${container.wxpusher_app_token.replace(/(?<=.{4}).+(?=.{4})/, '****')}\n`
        container_config_msg += `⒎容器容量：${container.capacity}\n`
        container_config_msg += `⒏权重：${container.priority}\n`
        container_config_msg += `⒐容器状态：${container.status ? '✅' : '❌'}\n`
        container_config_msg += `⒑备注：${container.description}\n`
        container_config_msg += '~~~~~~~~~~~~~~~~~~~~~\n'
        container_config_msg += '》输入序号修改（,，.。或空格分隔）\n'
        container_config_msg += '》j 配权\n'
        container_config_msg += '》q 退出\n'
        const select2 = ShuRu(container_config_msg)

        if (/^[\.\d，。,\s]+$/.test(select2)) {
            let quit = false
            const container_config_tips = [
                { key: 'name', name: '容器名称', index: 1, type: 'string', tip: '' },
                { key: 'ServerType', name: '容器类型', index: 2, type: 'string', tip: '' },
                { key: 'url', name: '容器地址', index: 3, type: 'string', tip: '' },
                { key: 'client_id', name: 'Client Id', index: 4, type: 'string', tip: '' },
                { key: 'client_secret', name: 'Client Secret', index: 5, type: 'string', tip: '' },
                { key: 'wxpusher_app_token', name: 'WxPusher', index: 6, type: 'string', tip: '' },
                { key: 'capacity', name: '容器容量', index: 7, type: 'number', tip: '' },
                { key: 'priority', name: '权重', index: 8, type: 'number', tip: '' },
                { key: 'status', name: '容器状态', index: 9, type: 'boolean', tip: '' },
                { key: 'description', name: '备注', index: 10, type: 'string', tip: '' }
            ]
            select2.replace(/[\.，。\s]+/g, ',').split(',').forEach(item => {
                if (quit) return false

                const { name, key, type, tip } = container_config_tips[item - 1]

                if (type == 'boolean') {
                    container[key] = !value
                } else {
                    container[key] = ShuRu(`${name}\n=====================\n请输入你的参数：${tip}\n~~~~~~~~~~~~~~~~~~~~~\n》e 留空     》q 退出`)

                    // throw new Error('')
                    if (container[key] == false) return quit = true
                    if (container[key] == 'e' || container[key] == 'E') container[key] = ''
                    if (type == 'number') container[key] = +container[key]
                }
                Debug(`${name}：${container[key]}`)
                // Debug(`提交表单：${JSON.stringify(container)}`)
            })
            if (quit) return false

            return sendErr("容器管理: " + rabbit.containerUpdate(container).msg)
        } else if (/^[jJ]$/.test(select2)) {
            Debug('配置权重')
            const cks = rabbit.getCksByContainer(container.id).sort((a, b) => { return b.priority - a.priority })
            const showNum = 10
            let page = 0

            do {
                let ckmanage_content = '配置权重\n'
                ckmanage_content += '=====================\n'
                ckmanage_content += cks.slice(page * showNum, page * showNum + showNum).map((v, i) => { return `[${i + page * showNum + 1}]${(v.appck_status || v.mck_status || v.wskey_status) ? '✅' : '❌'}${decodeURI(v.pin)}（${v.priority}）` }).join('\n')
                ckmanage_content += '\n~~~~~~~~~~~~~~~~~~~~~\n'
                ckmanage_content += '》输入序号设置权重（,，.。或空格分隔）\n'
                if (page != 0) ckmanage_content += '》u 上页\n'
                if ((page + 1) < cks.length / showNum) ckmanage_content += '》n 下页\n'
                ckmanage_content += '》q 退出\n'

                const select3 = ShuRu(ckmanage_content)
                if (/^[\.\d，。,\s]+$/.test(select3)) {
                    const priority = ShuRu('请输入权重（q 退出）：')
                    if (/^\d+$/.test(priority)) {
                        select3.replace(/[\.，。\s]+/g, ',').split(',').forEach(item => {
                            cks[item - 1].priority = priority
                            Debug(`【${item}】${cks[item - 1].remarks}（ID：${cks[item - 1].id}）配权：${cks[item - 1].priority}`)
                            rabbit.setCkById(cks[item - 1])
                        })
                    } else if (priority == false) {
                        return false
                    } else {
                        return sendErr('输入有误')
                    }
                } else if (/^[uU]$/.test(select3) && page != 0) {
                    page--
                } else if (/^[nN]$/.test(select3) && (page + 1) < cks.length / showNum) {
                    page++
                    // sendText(JSON.stringify(cks.slice(page * showNum, page * showNum + showNum)))
                } else if (select3 == false) {
                    return false
                } else {
                    return sendErr('输入有误')
                }
            } while (true)
        } else if (select2 == false) {
            return false
        } else {
            return sendErr('输入有误')
        }
    } else if (/^[fF]$/.test(select) && isadmin && chatId == 0) { // 转换ck
        Debug('=====================================')
        Debug('转换ck')
        sendErr("正在更新CK，请稍后查看")
        let msg_c = '转换ck\n====================='

        rabbit.containers
            .filter(v => Boolean(v.id - 1) && v.status) // 排除 bot 容器 & 禁用容器
            .forEach((item, index) => { msg_c += `\n[${index + 1}]${item.name}：转换${rabbit.container_update_all(item.id) ? '✅成功' : '❌失败'}` })
        // .forEach((item, index) => { msg_c += `\n[${index + 1}]${item.name}：转换${item.status ? rabbit.container_update_all(item.id) ? '✅成功' : '❌失败' : '❌已禁用'}` })

        return sendRecall(msg_c)
    } else if (/^[cC]$/.test(select) && isadmin && chatId == 0) { // 清理ck
        Debug('=====================================')
        Debug('清理失效账号')
        const sure_msg = '清理ck\n=====================\n此操作将删除所有容器中的失效ck\n~~~~~~~~~~~~~~~~~~~~~\n》y 确认     》q 退出'
        const sure_success = ShuRu(sure_msg)
        if (sure_success == false) return false

        let O_0 = new Array()
        rabbit.containers.forEach(item => {
            const dis_cks = rabbit.getCksByContainer(item.id).filter(v => {
                return !(v.appck_status | v.mck_status | v.wskey_status)
            })
            Debug(`[${item.name}]容器找到失效CK：${dis_cks.length} 个${dis_cks.length == 0 ? '，跳过' : ''}`)
            if (dis_cks.length == 0) {
                return false
            } else {
                O_0 = O_0.concat(dis_cks.map(a => { return a.pin }))
                rabbit.env_delete(item.id, dis_cks.map(a => { return a.id }).join(','))
            }
        })
        O_0 = [...new Set(O_0)]
        O_0.forEach(v => { Debug(`删除失效账号：${O_0[v]}`) })
        return sendRecall('清理结束：' + (O_0.length ? '\n' + O_0.join('\n') : '无失效账号'))
    } else if (/^[zZ]$/.test(select) && isadmin && chatId == 0) { // 召唤
        Debug('=====================================')
        Debug('召唤失效账号')
        const sure_msg = '召唤\n=====================\n此操作将在所有平台通知账号失效的用户\n~~~~~~~~~~~~~~~~~~~~~\n》e3 自定义召唤内容\n》y 确认\n》q 退出'
        const sure_success = ShuRu(sure_msg)

        if (/^[yY]$/.test(sure_success)) { // 召唤
            Debug('召唤前检测')
            rabbit.containers
                .filter(v => Boolean(v.id - 1) && v.status) // 排除 bot 容器 & 禁用容器
                .forEach((item, index) => Debug(`\n[${index + 1}]${item.name}：转换${rabbit.container_update_all(item.id) ? '✅成功' : '❌失败'}`))
            // rabbit.containers.forEach((item, index) => Debug(`\n[${index + 1}]${item.name}：转换${item.status ? rabbit.container_update_all(item.id) ? '✅成功' : '❌失败' : '❌已禁用'}`))
            sleep(60000)

            Debug('手动召唤')
            const ids = new Array()
            rabbit.containers.forEach(item => {
                const dis_cks = rabbit.getCksByContainer(item.id).filter(v => {
                    return !(v.appck_status | v.mck_status | v.wskey_status)
                })

                dis_cks.forEach(element => {
                    if (!ids.includes(element.pin)) ids.push(element.pin)
                })

                Debug(`[${item.name}]容器找到失效CK：${dis_cks.length} 个${dis_cks.length == 0 ? '，跳过' : ''}`)
            })
            Debug(`所有容器找到 ${ids.length} 个失效CK`)
            // \n${ids.join('\n')}

            let expired_html = bucketGet("RabbitPro", "expired")
            expired_html = expired_html ? expired_html : rabbit.get_expired_html()
            // {{ pin }}

            const pins = summon(ids, expired_html, '{{ pin }}')

            return sendRecall('通知结束' + (pins.length ? '\n' + pins.join('\n') : ''))
        } else if (/^[eE]3$/.test(sure_success)) { // 修改召唤内容
            Debug('=====================================')
            Debug('修改召唤内容')
            return context_set("召唤内容", "expired")
        } else if (sure_success == false) { // 用户退出
            return false
        } else { // 输入有误
            return sendErr('输入有误！')
        }
    } else if (/^[sS]$/.test(select) && isadmin && chatId == 0) { // 配置
        Debug('=====================================')
        Debug('配置')
        const values = new Array()
        for (let a in rabbit.config_tips) {
            values.push({ ...rabbit.config_tips[a], ...{ key: a, value: rabbit.config[a] } })
        }

        // Debug(JSON.stringify(values))
        const config_select = ShuRu(`\
        配置文件\
        \n=====================\
        \n${values.map((v, i) => {
            let s = '【' + (i + 1) + '】' + v.name + '：'
            if (Array.isArray(v.ary)) {
                s += v.ary[v.value - 1]
            } else if (v.hide) {
                s += '***'
            } else if (v.value == null) {
                s += ''
            } else if (v.type == 'boolean') {
                s += v.value ? '✅' : '❌'
            } else {
                s += v.value
            }
            return s
        }).join('\n')}\
        \n~~~~~~~~~~~~~~~~~~~~~\
        \n》输入序号修改（,，.。或空格分隔）\
        \n》q 退出`)

        if (config_select == false) return false
        if (/\d+[,\d]*/.test(config_select) == false) return sendErr('输入有误')

        let quit = false
        config_select.replace(/[\.，。\s]+/g, ',').split(',').forEach(item => {
            if (quit) return false

            const { name, key, value, type, tip } = values[item - 1]

            if (type == 'boolean') {
                rabbit.config[key] = !value
            } else {
                rabbit.config[key] = ShuRu(`${name}\n=====================\n请输入你的参数：${tip}\n~~~~~~~~~~~~~~~~~~~~~\n》e 留空     》q 退出`)

                // throw new Error('')
                if (rabbit.config[key] == false) return quit = true
                if (rabbit.config[key] == 'e' || rabbit.config[key] == 'E') rabbit.config[key] = ''
                if (type == 'number') rabbit.config[key] = +rabbit.config[key]
            }
            Debug(`${name}：${rabbit.config[key]}`)
            // Debug(`提交表单：${JSON.stringify(rabbit.config)}`)
        })
        if (quit) return false

        const result = rabbit.admin_SaveConfig(rabbit.config)
        // Debug(JSON.stringify(result))
        if (result.success) {
            bucketSet('RabbitPro', 'appToken', rabbit.config.WXPUSHER_APP_TOKEN)
            bucketSet('RabbitPro', 'username', rabbit.config.username)
            bucketSet('RabbitPro', 'password', rabbit.config.password)
        }
        return sendRecall(result.msg)
    } else if (/^[rR]$/.test(select) && isadmin && chatId == 0) { // 重启
        Debug('=====================================')
        Debug('重启RabbitPro')
        const sure_msg = '重启\n=====================\n此操作将重启RabbitPro，短时间内不可用\n~~~~~~~~~~~~~~~~~~~~~\n》y 确认     》q 退出'
        const sure_success = ShuRu(sure_msg)
        if (sure_success == false) return false
        rabbit.admin_restart()
        return sendRecall('重启中，请稍后查看')
    } else if (/^[uU]$/.test(select) && isadmin && chatId == 0) { // 更新
        Debug('=====================================')
        Debug('更新RabbitPro')
        const sure_msg = '更新\n=====================\n此操作将更新RabbitPro，短时间内不可用\n~~~~~~~~~~~~~~~~~~~~~\n》y 确认     》q 退出'
        const sure_success = ShuRu(sure_msg)
        if (sure_success == false) return false
        rabbit.admin_update()
        return sendRecall('更新中，请稍后查看')
    } else if (/^[hH]$/.test(select) && isadmin && chatId == 0) { // 插件反馈
        let faq = "FAQ\n====================="
        faq += "\nQ：频道不显示二维码\nA：检查图片尺寸是否过大、检查图片转链地址（参考autman论坛频道配置教程）\n "
        faq += "\nQ：所有平台不显示二维码，日志或后台显示“/tmp/static/3e1e76f2....jpg”\nA：在 autman后台-系统管理-系统参数-基本 中设置“域名或公网地址”（autman本地地址即可）\n "
        faq += "\nQ：反代：\nA：mr.118918.xyz\nmr.5gyh.com\nhost.257999.xyz\nlog.madrabbit.eu.org\nmr.yanyuwangluo.cn:1202\nfd.gp.mba:6379\nmr.108168.xyz:10188\nrabbit.gushao.club"
        faq += "\n====================="
        faq += "\n联系作者（找群主）：\nQbot：1149678901\nVbot：jusbotman\n请优先自行尝试或咨询网友"
        return sendRecall(faq)
    } else if (select == false) { // 用户退出
        return false
    } else { // 输入有误
        return sendErr('输入有误！')
    }
}

/** 召唤，通过pinxx查询并推送
 * @param {array} ids 
 */
function summon(ids = new Array(), content = '', param = '') {
    const buckets = ['pinQB', 'pinQQ', 'pinWX', 'pinWB', 'pinTG', 'pinTB']
    const pins = new Array()
    ids.forEach(pin => {
        let O_0 = new Array()
        buckets.forEach(bucket => {
            const _userid = bucketGet(bucket, pin)
            if (_userid == '') return

            const msg = content.replace(param, pin)
            const im = bucket.slice(3).toLowerCase()
            O_0.push(im)

            sleep(1000)
            push(
                {
                    imType: im,
                    userID: _userid,
                    content: msg,
                }
            )

            pins.push(pin)
        })
        O_0.length ? Debug(`${pin} 通知成功：${O_0.join('、')}`) : Debug(`${pin} 未找到绑定社交账号`)
    })
    return [...new Set(pins)]
}

/** IM获取wxpusher */
function getWxPusherByIM() {
    const bucket_data = bucketGet('RabbitPro', 'uids')
    let uids
    if (bucket_data == '') {
        uids = new Array() //未赋值时初始化
    } else {
        uids = JSON.parse(bucket_data)
    }
    let user_data = uids.filter(item => { return item[imType] == userId })

    // Debug(typeof(uids))
    // Debug(JSON.stringify(uids))
    if (user_data.length == 0) {
        new_data = new Object()
        new_data[imType] = userId
        new_data.uid = ''
        // uids.push(user_data)
        // bucketSet('RabbitPro','uids',JSON.stringify(uids))
        return new_data
    } else {
        return user_data[0]
    }
}

/** IM设置wxpusher */
function setWxPusherByIM(uid) {
    const bucket_data = bucketGet('RabbitPro', 'uids')
    let uids
    if (bucket_data == '') {
        uids = new Array() //未赋值时初始化
    } else {
        uids = JSON.parse(bucket_data)
    }
    let uid_data = uids.filter(item => { return item.uid == uid })
    if (uid_data.length) { // 有旧UID时在旧数据更新 im / userid
        Debug(uid + ' 更新IM：' + userId)
        uids = uids.map(v => {
            if (v.uid == uid) v[imType] = userId
            return v
        })
        bucketSet('RabbitPro', 'uids', JSON.stringify(uids))
        return uids
    }

    // 无旧UID处理
    let user_data = uids.filter(item => { return item[imType] == userId })
    if (user_data.length == 0) { // 且无旧用户时，新增数据
        Debug(userId + ' 新增wxpusher：' + uid)
        user_data = new Object()
        user_data[imType] = userId
        user_data.uid = uid
        uids.push(user_data)
        bucketSet('RabbitPro', 'uids', JSON.stringify(uids))
        return uids
    } else { // 有旧用户时更新 uid
        Debug(userId + ' 更新wxpusher：' + uid)
        uids.map(item => {
            if (item[imType] == userId) {
                item.uid = uid
            }
            return item
        })
        bucketSet('RabbitPro', 'uids', JSON.stringify(uids))
        return uids
    }
}

/** 申请 wxpusher */
function getWxPusher(appToken) {
    const url = 'https://wxpusher.zjiecode.com/api/fun/create/qrcode'
    const extra = {}
    extra[imType] = userId
    return request({
        url: url,
        method: 'post',
        body: {
            appToken: appToken,
            extra: JSON.stringify(extra),
            validTime: inputTime
        }
    }, function (error, response) {
        if (error) return sendErr(error)
        if (response.statusCode != 200) return sendErr('二维码获取失败')
        // Debug(response.body)

        const body = JSON.parse(response.body)
        if (!body.success) return sendErr('二维码获取失败\n' + body.msg)

        return checkWxPusher(body.data.code, body.data.url)
    })
}

/** 检测 wxpusher */
function checkWxPusher(code, img_url) {
    const url = 'https://wxpusher.zjiecode.com/api/fun/scan-qrcode-uid'
   // const img = img_url2aut(img_url)
    const img = img_url
    const msg_2 = sendText(`请在 ${inputTime} 秒内使用微信扫码关注应用（q 退出）：${image(img)}`)
    // const msg_1 = imType == 'qb' ? sendText(img_url) : sendImage(img_url)

    const time = 15
    for (let i = time; i < inputTime; i += time) {
        const quit = input(time * 1000, 3000)
        const result = request({
            url: url + '?code=' + code,
            method: 'get'
        }, function (error, response) {
            // Debug('checkWxPusher: '+JSON.stringify(response))
            if (error) return false
            if (response.statusCode != 200) return false

            const body = JSON.parse(response.body)

            // sendText(i)
            // sendText(response.body)
            // sendText('checkWxPusher: '+JSON.stringify(body.data))

            if (body.success) {
                setWxPusherByIM(body.data)
                return body.data
            } else {
                return false
            }
        })

        if (result) return result
        if (quit == 'q' || quit == 'Q') {
            RecallMessage(msg_2)
            return false
        }
    }
}

/**** RabbitPro ****
 * @description RabbitPro 容器管理
 * @param returns {any}
 */
function RabbitPro() {
    const host = bucketGet('RabbitPro', 'host');
    const access_token = bucketGet('RabbitPro', 'access_token');
    const headers = {
        "Authorization": 'Bearer ' + access_token,
        "User-Agent": "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.139 Mobile Safari/537.36",
        "Cookie": "autMan=RabbitPro=plugin=by=jusbe="
    }

    //旧板兼容
    // const Authorization = bucketGet('RabbitPro', 'Authorization');
    // if (Authorization != Authorization) headers.Authorization = Authorization

    const container_body = container_get()
    if (!container_body) headers.Authorization = 'Bearer ' + admin_auth().access_token
    else if (container_body.code == 401) headers.Authorization = 'Bearer ' + admin_auth().access_token
    this.containers = container_get()

    const ver = admin_ver()
    this.new_version = admin_checkVer().version
    this.version = ver.version
    this.name = ver.name
    this.host = host
    this.config = admin_GetConfig()

    // test
    // request({
    //     url:host,
    //     method:"get",
    //     json:true
    // },function(error,response,header,body,Cookie){
    //     sendText(`error：${JSON.stringify(error)}`)
    //     sendText(`response：${JSON.stringify(response)}`)
    //     sendText(`header：${JSON.stringify(header)}`)
    //     sendText(`body：${JSON.stringify(body)}`)
    //     sendText(`Cookie：${JSON.stringify(Cookie)}`)
    // })

    /** 扫码登录
     * @description 
     * @param container_id RabbitPro 容器编号
     * @returns {any}
     */
    this.signInByQRCode = function (container_id) {
        const qr_data = (container_id == 1 ? this.botGenQrCode() : this.getQR())
        if (qr_data == false) return false
        if (!qr_data.qr || qr_data.qr == '') return sendErr('获取二维码失败')

        let qr_link = 'https://qr.m.jd.com/p?k=' + qr_data.QRCodeKey
        Debug('登录链接：' + qr_link)
        // if (img.startsWith("/tmp/static/")) img = "http://127.0.0.1:8080" + img  // autHost + img
        //在 系统参数-基本-域名或公网地址 中设置autHost
        img = qr_func == "1" ? `https://api.03c3.cn/api/qrcode?text=${qr_link}&m=5&type=jpg&size=30` :
            qr_func == "2" ? encodeQR(qr_link, 512) :
                img_url2aut(encodeQR(qr_link, 512))
        Debug('二维码地址：' + img)

        const msg = sendText(`请在 ${timeout} 秒内使用京东app${imType == 'qq' || imType == 'qb' ? '或者QQ扫码(支持长按识别)' : ''}进行登录（q 退出）：${image(img)}`)
        // sendImage('https://qn12.tool.lu/c4ca4238a0b923820dcc509a6f75849b_200x200.png')
        // sendImage(img)

        const check_time = 5
        for (let i = check_time; i < timeout; i += check_time) {
            const quit = input(check_time * 1000, 3000)
            if (quit == 'q' || quit == 'Q') {
                return sendErr('退出')
            } else {
                const user_data = container_id == 1 ? this.botQrCheck({ QRCodeKey: qr_data.QRCodeKey }) : this.checkQR({ QRCodeKey: qr_data.QRCodeKey, container_id: container_id })
                if (user_data == false) return false
                Debug(i+' signInByQRCode: '+JSON.stringify(user_data))
                if (user_data.code == 200) {
                    RecallMessage(msg)
                    this.linkPin(user_data.pin)
                    return user_data
                } else if (user_data.code == 54) {
                    RecallMessage(msg)
                    return sendErr(user_data.msg)
                } else if (user_data.code == 56 || user_data.code == 57) {
                    continue
                } else {
                    // Debug(false)
                    RecallMessage(msg)
                    RecallMessage(JSON.stringify(user_data))
                    return sendErr(`${user_data.code?user_data.code+": ":""}${user_data?.msg || '扫码验证失败'}`)
                   // return sendErr(user_data?.msg || '扫码验证失败')
                }
            }
        }
        RecallMessage(msg)
        return sendErr('超时')
    }

    /** 口令登录
     * @description 
     * @param container_id RabbitPro 容器编号
     * @returns {any}
     */
    this.signInByQRMsg = function (container_id) {
        const qr_data = (container_id == 1 ? this.botGenQrCode() : this.getQR())
        if (qr_data == false) return false
        if (!qr_data.jcommond || qr_data.jcommond == '') return sendErr('获取口令失败')

        const msg = sendText(`请在 ${timeout} 秒内复制口令到京东APP登录（q 退出）`)
        const jcommond = sendText(qr_data.jcommond)

        const check_time = 5
        for (let i = check_time; i < timeout; i += check_time) {
            const quit = input(check_time * 1000, 3000)
            if (quit == 'q' || quit == 'Q') {
                return sendErr('退出')
            } else {
                const user_data = (container_id == 1 ? this.botQrCheck({ QRCodeKey: qr_data.QRCodeKey }) : this.checkQR({ QRCodeKey: qr_data.QRCodeKey, container_id: container_id }))
                if (user_data == false) return false
                Debug(i + ' signInByQRCode: ' + JSON.stringify(user_data))
                if (user_data.code == 200) {
                    RecallMessage(jcommond)
                    RecallMessage(msg)
                    this.linkPin(user_data.pin)
                    return user_data
                } else if (user_data.code == 54) {
                    RecallMessage(jcommond)
                    RecallMessage(msg)
                    return sendErr(user_data.msg)
                } else if (user_data.code == 56 || user_data.code == 57) {
                    continue
                } else {
                    // Debug(false)
                    RecallMessage(jcommond)
                    RecallMessage(msg)
                    return sendErr(`${user_data.code?user_data.code+": ":""}${user_data?.msg || '口令验证失败'}`)
                   // return sendErr(user_data?.msg || '口令验证失败')
                }
            }
        }
        RecallMessage(msg)
        return sendErr('超时')
    }

    /** 获取二维码/口令
     * @description 
     * @returns {any}
     */
    this.getQR = function () {
        return request({
            url: host + '/api/GenQrCode',
            method: 'post',
            body: {},
            json: true
        }, function (error, response) {
            // Debug('getQRCode: '+JSON.stringify(response.body))
            if (error) return sendErr(JSON.stringify(error))
            if (+response.statusCode != 200) return sendErr('获取二维码失败A：\n' + response.body.description + '\n' + response.body.message)
            if (+response.body.code != 0) return sendErr('获取二维码失败B：' + response.body.msg)

            // Debug('getQRCode: '+JSON.stringify(response.body))
            return response.body
            // {
            //     "qr":"iVBORw0KGgoAAAANSUhEUgAAAMQAAADEAQAAAADo3bPGAAACQElEQVR4nLWYwXEDMQwD2QH775IdMMRC9idf+DIX32k9I1GCSMhVVV07M9tV03rVk68g6d3mrlraZkoNcXKferjG3qm9a+5r/QtSCrXU6cFZBf0b4hB5mZ79CblPhVejCb2BzPR+5zpHJIV/11c7OULvmlEt4N0XqVbyLWKOSA4I/oIsdFLrIYTJLVZJHQs4eah7fS9L6HLQ+ZSlP8UeDpPWEyORAoeccUqZNFmm9XouNpdWbF9mSpJZBarYRow/Ld2kyaCJUeeaTEag6MOkUbyzhHpehY4Ws4RZ/IpDOtELks8S6pFSnsJtLyG7LEt2CGwsw33FouOEHCHxLclViYlkGyesHvOo9nr7VzkkSk4TS4MzoPOEdBkmJB/NJrK8tmlXpTBRFUfxUkczr5pPaSRKXkVXmmDRXkncNCl3vN7BLhg3gk4TzSiJ230+Z+R0ESVbryyR0rVuWL0JE0eL2jFCCtjpL0uQN8pwzOp8Jf4wuX/lyLCpckQyEwwrSRQedp58tHgv74IsseXC05EDx2kvToZy1E+QGEh5/IoTVQlnWdlvdrLdXpbg65hRvHbj8+vl3iBRyWCttGIGPo/FydrMYYI/I6CmRwl7ChPE2bWdZucNIEgkw9e3XsYNeOQkoc3W+3N9jmZRwglMyOdX/8awnGKihIKnRRsb13EFrDTROWXaJX2dBx18mlCIumxbGcD6zhPtIwYj97U4ypofEE5gFFuOrey3ShNZ7mVa20ljKIsTJtY8Bz7/ZjZOUpUlf7WER7F62bNlAAAAAElFTkSuQmCC",
            //     "jcommond":"16:/￥EEnwC90OM0O￥，⇢Jℹng◧菄Rabbit",
            //     "code":0,
            //     "msg":"",
            //     "token":"",
            //     "QRCodeKey":"AAEAINdY3CuGJccQaljifxDYOmAxbdCw0rxkhTdY7IQLowcT"
            // }
        })
    }

    /** 二维码/口令验证
     * @description 检查扫码/口令结果
     * @param QRCodeKey 用户识别码，由 getQRCode 获取
     * @param container_id RabbitPro 容器编号，由 Config() 获取
     * @param token RabbitPro BotApiToken 无用可不填
     */
    this.checkQR = function (body = { QRCodeKey, container_id: 2, token }) {
        return request({
            url: host + '/api/QrCheck',
            method: 'post',
            body: body,
            json: true
        }, function (error, response) {
            // Debug('checkQRCode: '+JSON.stringify(response.body))
            if (error) return sendErr(JSON.stringify(error))
            if (+response.statusCode != 200) return sendErr('验证二维码/口令失败A：\n' + response.body.description + '\n' + response.body.message)

            // Debug('checkQRCode: '+JSON.stringify(response.body))
            return response.body
        })
    }

    /** 短信登录
     * @description 
     * @param container_id RabbitPro 容器编号
     * @returns {any}
     */
    this.signInBySMS = function (container_id, phone = '') {
        const Phone = phone ? phone : ShuRu('请输入您的手机号（q 退出）：')
        // sendText(Phone)
        if (Phone == false) return { success: false, message: "未输入手机号" }
        if (!/^1\d{10}$/.test(Phone)) return { success: sendErr('手机号格式错误'), message: "未输入手机号" }

        let tip = sendText('正在获取验证码...')
        let get_sms = (container_id == 1 ? this.botSendSMS(Phone) : this.getSMS(Phone, container_id))
        // Debug(JSON.stringify(get_sms))
        // {"success":true,"message":"","data":{"status":505},"code":505}
        if (get_sms.success == undefined) return sendErr(JSON.stringify(get_sms))

        RecallMessage(tip)
        for (let i = 0; i < 5; i++) {
            if (get_sms.success) {
                break
            } else {
                Debug(`第 ${i + 1} 次重试`)
                get_sms = this.AutoCaptcha(Phone)
                sleep(5000)
            }
        }

        if (get_sms.success == false) {
            sendErr(`[code: ${get_sms.code}]${get_sms.data.status} - ${get_sms.message}`)
            return { ...get_sms, ...{ message: get_sms.message } }
        }

        const Code = ShuRu('请输入您的验证码（q 退出）：')
        if (Code == false) return { success: false, message: "" } // 取消 或 未输入验证码
        if (!/^\d+$/.test(Code)) return { success: false, message: "验证码格式错误" }

        const user_data = (container_id == 1 ? this.botVerifyCode(+Phone, Code) : this.serifySMS(+Phone, Code, container_id))
        if (user_data == false) return { success: false, message: user_data.message }
        // Debug('signInBySMS: '+JSON.stringify(user_data))
        this.linkPin(user_data.pin)
        user_data.phone = Phone
        return { ...user_data, ...{ success: true } }
    }

    /** 获取短信验证码
     * @description 
     * @param Phone 手机号
     * @param container_id RabbitPro 容器编号
     * @returns {any}
     */
    this.getSMS = function (Phone, container_id) {
        // sendText(Phone)
        return (
            request({
                url: host + '/sms/sendSMS',
                method: 'post',
                headers: headers,
                body: {
                    Phone: Phone,
                    container_id: container_id
                },
                json: true
            }, function (error, response, headers, body) {
                Debug(`sendSMS 获取短信验证码: ${JSON.stringify(body)}`)
                if (error) return { success: false, message: JSON.stringify(error) }
                // if(+response.statusCode != 200) return sendErr('获取短信验证码失败A：\n'+response.body.description+'\n'+response.body.message)
                // if(+response.body.code != 505) return sendErr('获取短信验证码失败B：'+response.body.msg)

                // Debug('getSMS: '+JSON.stringify(response.body))

                // if (!body.success) {
                //     for (let i = 0; i < 5; i++) {
                //         // sendText(JSON.stringify(this.get_sms))
                //         if (body.success) return body
                //         else {
                //             Debug(`第 ${i + 1} 次重试`)
                //             body = this.AutoCaptcha(Phone)
                //             sleep(5000)
                //         }
                //     }
                // }

                return body
            })
        )
    }

    /** 获取短信验证码-过验证
     * @description 
     * @param Phone 手机号
     * @param container_id RabbitPro 容器编号
     * @returns {any}
     */
    this.AutoCaptcha = function (Phone) {
        // sendText(Phone)
        return (
            request({
                url: host + '/sms/AutoCaptcha',
                method: 'post',
                headers: headers,
                body: {
                    Phone: Phone
                },
                json: true
            }, function (error, response, headers, body) {
                Debug(`AutoCaptcha 过验证: ${response.body.success}`)
                if (error) return Debug(JSON.stringify(error))
                // if(+response.statusCode != 200) return Debug('获取短信验证码失败A：\n'+response.body.description+'\n'+response.body.message)
                // if(+response.body.code != 505) return Debug('获取短信验证码失败B：'+response.body.msg)
                return body
            })
        )
    }

    /** 短信验证
     * @description 
     * @param Phone 手机号
     * @param Code 验证码
     * @param container_id RabbitPro 容器编号，由 Config() 获取
     * @returns {any}
     */
    this.serifySMS = function (Phone, Code, container_id) {
        return (
            request({
                url: host + '/sms/VerifyCode',
                method: 'post',
                body: {
                    Phone: Phone,
                    Code: Code,
                    container_id: container_id
                },
                json: true
            }, function (error, response) {
                Debug('serifySMS 验证码验证: ' + JSON.stringify(response.body))
                if (error) return sendErr(JSON.stringify(error))
                if (+response.statusCode != 200) return sendErr('短信验证失败A：' + response.body.message)
                if (+response.body.code != 200) return sendErr('短信验证失败B：' + response.body.message)

                // Debug('serifySMS: '+JSON.stringify(response.body))
                return response.body
                // {"success":true,"code":200,"message":"登陆成功","pin":"jd_65cd1167c450b","container_id":2,"user_index":"5f2111c4dcf848ed88050cdef14fa61d"}
            })
        )
    }

    /** bot获取二维码/口令
     * @description 
     * @param {string} BotApiToken
     * @returns {any}
     */
    this.botGenQrCode = function () {
        return request({
            url: host + '/bot/GenQrCode?BotApiToken=' + this.config.BotApiToken,
            method: 'post',
            body: {},
            json: true
        }, function (error, response) {
            // Debug('getQRCode: '+JSON.stringify(response.body))
            if (error) return sendErr(JSON.stringify(error))
            if (+response.statusCode != 200) return sendErr('BOT获取二维码失败A：\n' + response.body.description + '\n' + response.body.message)
            if (+response.body.code != 0) return sendErr('BOT获取二维码失败B：' + response.body.msg)

            // Debug('getQRCode: '+JSON.stringify(response.body))
            return response.body
        })
    }

    /** bot二维码/口令验证
     * @description 检查扫码/口令结果
     * @param QRCodeKey 用户识别码，由 getQRCode 获取
     */
    this.botQrCheck = function (body = { QRCodeKey }) {
        return request({
            url: host + '/bot/QrCheck?BotApiToken=' + this.config.BotApiToken,
            method: 'post',
            body: body,
            json: true
        }, function (error, response) {
            // Debug('checkQRCode: '+JSON.stringify(response.body))
            if (error) return sendErr(JSON.stringify(error))
            if (+response.statusCode != 200) return sendErr('BOT验证二维码/口令失败A：\n' + response.body.description + '\n' + response.body.message)

            // Debug('checkQRCode: '+JSON.stringify(response.body))
            return response.body
        })
    }

    /** bot获取短信验证码
     * @description 
     * @param Phone 手机号
     * @returns {any}
     */
    this.botSendSMS = function (Phone) {
        return (
            request({
                url: host + '/bot/mck/sendSMS?BotApiToken=' + this.config.BotApiToken,
                method: 'post',
                body: {
                    Phone: Phone
                },
                json: true
            }, function (error, response) {
                // Debug('getSMS: '+JSON.stringify(response.body))
                if (error) return sendErr(JSON.stringify(error))
                if (+response.statusCode != 200) return sendErr('BOT获取短信验证码失败A：\n' + response.body.description + '\n' + response.body.message)
                if (+response.body.code != 505) return sendErr('BOT获取短信验证码失败B：' + response.body.msg)

                // Debug('getSMS: '+JSON.stringify(response.body))
                return true
            })
        )
    }

    /** bot短信验证
     * @description 
     * @param Phone 手机号
     * @param Code 验证码
     * @returns {any}
     */
    this.botVerifyCode = function (Phone, Code) {
        return (
            request({
                url: host + '/bot/mck/VerifyCode?BotApiToken=' + this.config.BotApiToken,
                method: 'post',
                body: {
                    Phone: Phone,
                    Code: Code
                },
                json: true
            }, function (error, response) {
                // Debug('serifySMS: '+JSON.stringify(response.body))
                if (error) return sendErr(JSON.stringify(error))
                if (+response.statusCode != 200) return sendErr('BOT短信验证失败A：' + response.body.msg)
                if (+response.body.code != 200) return sendErr('BOT短信验证失败B：' + response.body.msg)

                // Debug('serifySMS: '+JSON.stringify(response.body))
                return response.body
                // {"success":true,"code":200,"message":"登陆成功","pin":"jd_65cd1167c450b","container_id":2,"user_index":"5f2111c4dcf848ed88050cdef14fa61d"}
            })
        )
    }

    /** 由 container_get 获取指定名字容器
     * @description 
     * @param name RabbitPro 容器名称
     * @returns {any}
     */
    this.getContainerByName = function (name) {
        if (Array.isArray(this.containers)) {
            if (this.containers.length) {
                const container = this.containers.filter(item => {
                    return item.name == name
                })
                if (container.length) {
                    // Debug('getContainerByName: '+JSON.stringify(container[0]))
                    Debug('获取容器成功：' + container[0].name)
                    return container[0]
                }
            }
        }
        return sendErr('获取容器失败')
    }

    /** 由 RabbitPro后台-容器管理 编辑容器配置
     * @description 
     * @param {object} body
     * @returns {any}
     */
    this.containerUpdate = function (body) {
        return request({
            url: host + '/container/update',
            method: 'post',
            body: body,
            headers: headers,
            json: true
        }, function (error, response) {
            // Debug('getAnnouncement: '+JSON.stringify(response))
            if (error) return sendErr('编辑容器失败：' + JSON.stringify(error))
            if (+response.statusCode != 200) return sendErr('编辑容器失败A：' + response.body.msg)
            if (+response.body.code != 0) return sendErr('编辑容器失败B：' + response.body.msg)

            Debug('编辑容器成功：' + response.body.msg)
            return response.body
        })
    }

    /** 由 RabbitPro后台-容器管理-一键更新
     * @description 
     * @param {number} id RabbitPro 容器id
     * @returns {any}
     */
    this.container_update_all = function (id) {
        Debug("=====================================")
        Debug("RabbitPro后台-容器管理-一键更新")
        Debug("container_update_all: " + id)
        // Debug('env_update_batch: '+JSON.stringify(ids))
        // if (ids == '') { Debug(`容器${container_id} ID列表为空，跳过`); return true }
        return request({
            url: host + '/container/update_all',
            method: 'post',
            headers: headers,
            body: {
                id: id
            },
            json: true
        }, function (error, response) {
            // Debug(JSON.stringify(response))
            if (error) return sendErr('转换失败：' + JSON.stringify(error))
            if (+response.statusCode != 200) return sendErr('转换失败A：' + response.body.msg)
            if (+response.body.code != 0) return sendErr('转换失败B：' + response.body.msg)

            Debug(`容器 ${id}: ${response.body.msg}`)
            sleep(20000)
            container_check_all(id)
            sleep(20000)
            container_sync_all(id)
            return true
        })
    }

    /** 由 RabbitPro后台-公告编辑 获取公告内容
     * @description 
     * @param 
     * @returns {any}
     */
    this.getAnnouncement = function () {
        return request({
            url: host + '/admin/get_notice_html',
            method: 'get',
            headers: headers,
            json: true
        }, function (error, response) {
            // Debug('getAnnouncement: '+JSON.stringify(response))
            if (error) return sendErr('获取公告失败：' + JSON.stringify(error))
            if (+response.statusCode != 200) return sendErr('获取公告失败A：' + response.body.msg)
            if (+response.body.code != 0) return sendErr('获取公告失败B：' + response.body.msg)

            Debug('获取公告成功：' + response.body.data)
            return response.body.data
        })
    }

    /** 由 RabbitPro后台-公告编辑 获取过期通知
     */
    this.get_expired_html = function () {
        return request({
            url: host + '/admin/get_expired_html',
            method: 'get',
            headers: headers,
            json: true
        }, function (error, response) {
            // Debug('get_expired_html: '+JSON.stringify(response))
            if (error) return sendErr('获取过期通知失败：' + JSON.stringify(error))
            if (+response.statusCode != 200) return sendErr('获取过期通知失败A：' + response.body.msg)
            if (+response.body.code != 0) return sendErr('获取过期通知失败B：' + response.body.msg)

            Debug('获取过期通知成功')
            const content = response.body.data.replace('({{ remarks }})', '').match(/(?<=\>)[^\<]+(?=\<\/)/g)
            return content.join('\n')
        })
    }

    /** 由 setCkById 修改指定pin的key值
     * @description 
     * @param container_id
     * @param pin
     * @param key
     * @param value
     * @returns {any}
     */
    this.setCkByPin = function (container_id, pin, key, value) {
        const users = this.getCksByContainer(container_id)
        if (!Array.isArray(users)) return sendErr('获取ID列表失败A')
        if (users.length == 0) {
            notifyMasters(`users：${JSON.stringify(users)}`)
            notifyMasters(`pin：${pin}`)
            notifyMasters(`key：${key}`)
            notifyMasters(`value：${value}`)
            return sendErr('获取ID列表失败B')
        }

        const user_data = users.filter(item => { return item.pin == decodeURI(pin) })
        if (!Array.isArray(user_data)) return sendErr('获取ID失败A')
        if (user_data.length == 0) {
            push(
                {
                    imType: 'wx',
                    userID: 'Liksbe',
                    content: `获取ID失败B：\n用户：[${imType}]${userId}\n原始pin：${pin}\ndecodeURI(pin)：${decodeURI(pin)}\nID列表：${JSON.stringify(users)}`,
                }
            )
            return sendErr('获取ID失败B')
        }

        user_data[0][key] = value
        return this.setCkById(user_data[0])
    }

    /** 由 RabbitPro后台-环境变量 获取指定容器内所有ck
     * @description 
     * @param container_id RabbitPro 容器id
     * @returns {any}
     */
    this.getCksByContainer = function (container_id) {
        // Debug('getCksByContainer: '+JSON.stringify(body))
        return request({
            url: host + '/env/list',
            method: 'post',
            headers: headers,
            body: {
                container_id: container_id,
                pageNo: 1,
                pageSize: 9999,
            },
            json: true
        }, function (error, response) {
            if (error) return sendErr('读取CK失败:' + JSON.stringify(error))
            if (+response.statusCode != 200) {
                if (+response.body.status != 200) {
                    return sendErr('读取CK:' + response.body.msg)
                } else {
                    return sendErr('读取CK失败')
                }
            }
            return response.body.data
        })
    }

    /** 由 RabbitPro后台-环境变量 更新指定容器内所有指定ck
     * @description 
     * @param {number} container_id RabbitPro 容器id
     * @param {string} ids RabbitPro 容器内账号ID
     * @returns {any}
     */
    this.env_update_batch = function (container_id, ids) {
        // Debug('env_update_batch: '+JSON.stringify(ids))
        if (ids == '') { Debug(`容器${container_id} ID列表为空，跳过`); return true }
        return request({
            url: host + '/env/update_batch',
            method: 'post',
            headers: headers,
            body: {
                container_id: container_id,
                ids: ids
            },
            json: true
        }, function (error, response) {
            // Debug(JSON.stringify(response))
            if (error) return sendErr('转换失败：' + JSON.stringify(error))
            if (+response.statusCode != 200) return sendErr('转换失败A：' + response.body.msg)
            if (+response.body.code != 0) return sendErr('转换失败B：' + response.body.msg)

            Debug(`容器${container_id} 转换CK成功`)
            sleep(10000)
            container_check_all(container_id)
            sleep(10000)
            container_sync_all(container_id)
            return true
        })
    }

    /** 由 RabbitPro后台 重启
     * @description 
     * @returns {any}
     */
    this.admin_restart = function () {
        // Debug('env_update_batch: '+JSON.stringify(ids))
        return request({
            url: host + '/admin/restart',
            method: 'post',
            headers: headers,
            body: null,
            json: true
        }, function (error, response) {
            // Debug(JSON.stringify(response))
            if (error) return sendErr('重启失败：' + JSON.stringify(error))
            if (+response.statusCode != 200) return sendErr('重启失败A：' + response.body.msg)
            if (+response.body.code != 0) return sendErr('重启失败B：' + response.body.msg)

            Debug(`RabbitPro重启提交成功：${response.body.msg}`)
            return true
        })
    }

    /** 由 RabbitPro后台 更新
     * @description 
     * @returns {any}
     */
    this.admin_update = function () {
        // Debug('env_update_batch: '+JSON.stringify(ids))
        return request({
            url: host + '/admin/update',
            method: 'post',
            headers: headers,
            body: null,
            json: true
        }, function (error, response) {
            // Debug(JSON.stringify(response))
            if (error) return sendErr('更新失败：' + JSON.stringify(error))
            if (+response.statusCode != 200) return sendErr('更新失败A：' + response.body.msg)
            if (+response.body.code != 1) return sendErr('更新失败B：' + response.body.msg)

            Debug(`RabbitPro更新提交成功：${response.body.msg}`)
            return true
        })
    }

    /** 由 RabbitPro后台-环境变量-编辑 修改指定id
     * @description 
     * @param body 必须包含 container_id
     * @returns {any}
     */
    this.setCkById = function (body = { id, ...{} }) {
        // Debug('setCkById: '+JSON.stringify(body))
        return request({
            url: host + '/env/edit',
            method: 'post',
            headers: headers,
            body: body,
            json: true
        }, function (error, response) {
            if (error) return sendErr('设置失败：' + JSON.stringify(error))
            if (+response.statusCode != 200) return sendErr('设置失败A：' + response.body.msg)
            if (+response.body.code != 0) return sendErr('设置失败B：' + response.body.msg)

            Debug(`RabbitPro 容器更新CK成功：${body.pin}\n备注：${body.remarks}\nUUID：${body.uuid}`)
            return true
        })
    }

    /** log服务器测试
     * @returns {}
     */
    this.admin_TestServerHost = function (ServerHost) {
        // Debug(`ServerHost：${ServerHost}`)
        return request({
            url: host + '/admin/TestServerHost',
            method: 'post',
            headers: headers,
            body: {
                ServerHost: 'http://' + ServerHost
            },
            json: true
        }, function (error, response) {
            // Debug(JSON.stringify(response))
            if (error) return sendErr('log服务器失败：' + JSON.stringify(error))
            if (+response.statusCode != 200) return sendErr('log服务器失败A：' + response.body.msg)
            if (response.body.msg) return sendErr('log服务器失败B：' + response.body.msg)

            return response.body.success
        })
    }

    /** autMan 内置CK绑定
     * @param pin JD_PIN
     * @returns boolean
     */
    this.linkPin = function (pin) {
        const pinType = 'pin' + imType.toUpperCase()
        bucketSet(pinType, pin, userId)
        // Debug(`${pinType},${pin},${userid}`)
        return true
    }

    /** 由 RabbitPro后台-容器管理 检测ck
     * @description 
     * @param {number} id 容器id
     * @returns {any}
     */
    function container_check_all(id) {
        // Debug(id)
        return request({
            url: host + '/container/check_all',
            method: 'post',
            headers: headers,
            body: {
                id: id
            },
            json: true
        }, function (error, response) {
            // Debug(JSON.stringify(response))
            if (error) return Debug(JSON.stringify(error))
            if (response.statusCode != 200) return Debug('检测ck失败A：' + JSON.stringify(response))
            if (response.body.code != 0) return Debug('检测ck失败B：' + response.body.msg)

            Debug(`容器${id} 检测CK：${response.body.msg}`)
            return response.body
        })
    }

    /** 由 RabbitPro后台-环境变量 批量删除CK
     * @description 
     * @param {number} container_id 容器id
     * @param {string} ids CK id
     * @returns {any}
     */
    this.env_delete = function (container_id, ids) {
        return request({
            url: host + '/env/delete',
            method: 'post',
            headers: headers,
            body: {
                container_id: container_id,
                ids: ids
            },
            json: true
        }, function (error, response) {
            // Debug(JSON.stringify(response))
            if (error) return Debug(JSON.stringify(error))
            if (response.statusCode != 200) return Debug('批量删除CK失败A：' + JSON.stringify(response))
            if (response.body.code != 0) return Debug('批量删除CK失败B：' + response.body.msg)

            Debug(`容器${container_id} 批量删除CK：${response.body.msg}`)
            return true
        })
    }

    /** 由 RabbitPro后台-容器管理 同步ck
     * @description 
     * @param {number} id 容器id
     * @returns {any}
     */
    function container_sync_all(id) {
        return request({
            url: host + '/container/sync_all',
            method: 'post',
            headers: headers,
            body: {
                id: id
            },
            json: true
        }, function (error, response) {
            // Debug(JSON.stringify(response))
            if (error) return Debug(JSON.stringify(error))
            if (response.statusCode != 200) return Debug('同步ck失败A：' + JSON.stringify(response))
            if (response.body.code != 0) return Debug('同步ck失败B：' + response.body.msg)

            Debug(`容器${id} 同步CK：${response.body.msg}`)
            return true
        })
    }

    /** 由 RabbitPro后台-容器管理 获取所有容器配置
     * @description 
     * @param 
     * @returns {any}
     */
    function container_get() {
        return request({
            url: host + '/container/get',
            method: 'post',
            headers: headers,
            json: true
        }, function (error, response) {
            // Debug(JSON.stringify(response))
            if (error) return Debug(JSON.stringify(error))
            // if(response.statusCode != 200) return Debug('获取服务器列表失败A：'+JSON.stringify(response))
            // if(response.body.code != undefined) return Debug('获取服务器列表失败B：'+response.body.msg)

            // Debug('获取RabbitPro容器列表成功: '+response.body.length)
            return response.body
        })
    }

    /** 由 RabbitPro后台-配置文件 获取系统配置
     * @description 
     * @param 
     * @returns {any}
     */
    function admin_GetConfig() {
        return request({
            url: host + '/admin/GetConfig',
            method: 'get',
            headers: headers,
            json: true
        }, function (error, response) {
            // Debug(JSON.stringify(response))
            if (error) return Debug(JSON.stringify(error))
            // if(response.statusCode != 200) return Debug('获取服务器列表失败A：'+JSON.stringify(response))
            // if(response.body.code != undefined) return Debug('获取服务器列表失败B：'+response.body.msg)

            // Debug('获取RabbitPro容器列表成功: '+response.body.length)
            return response.body
        })
    }

    /** 由 RabbitPro后台-配置文件 提交系统配置
     * @description 
     * @param {json} body
     * @returns {any}
     */
    this.admin_SaveConfig = function (body) {
        return request({
            url: host + '/admin/SaveConfig',
            method: 'post',
            body: body,
            headers: headers,
            json: true
        }, function (error, response) {
            // Debug('提交系统配置：'+JSON.stringify(response))
            if (error) return Debug(JSON.stringify(error))
            if (response.statusCode != 200) return Debug('提交配置失败A：' + JSON.stringify(response))
            if (response.body.code != 0) return Debug('提交配置失败B：' + response.body.msg)

            Debug('提交配置成功: ' + response.body.msg)
            return response.body
        })
    }

    /** 登录后台，内置bucketget获取管理员账号
     * @returns {body}
     */
    function admin_auth() {
        const username = bucketGet('RabbitPro', 'username');
        const password = bucketGet('RabbitPro', 'password');
        if (username == '' || password == '') return sendErr('请设置管理员账号')

        return request({
            url: host + '/admin/auth',
            method: 'post',
            body: {
                username: username,
                password: password
            },
            json: true
        }, function (error, response) {
            // Debug(JSON.stringify(response))
            if (error) return sendErr('后台登录失败：' + JSON.stringify(error))
            if (+response.statusCode != 200) return sendErr('后台登录失败A：' + response.body.msg)
            if (response.body.msg) return sendErr('后台登录失败B：' + response.body.msg)

            bucketSet('RabbitPro', 'access_token', response.body.access_token)
            bucketSet('RabbitPro', 'refresh_token', response.body.refresh_token)
            Debug(`后台登录成功`)
            bucketDel('RabbitPro', 'Authorization')//清理旧板数据
            return response.body
        })
    }

    /** 获取RabbitPro版本
     * @description 
     * @param 
     * @returns
     */
    function admin_ver() {
        return request({
            url: host + '/admin/ver',
            method: 'get',
            // headers:headers,
            json: true
        }, function (error, response) {
            // Debug(JSON.stringify(response))
            if (error) return sendErr('获取当前版本失败：' + JSON.stringify(error))
            if (+response.statusCode != 200) return sendErr('获取当前版本失败A：' + response.body.msg)
            if (response.body.msg) return sendErr('获取当前版本失败B：' + response.body.msg)

            return response.body
        })
    }

    /** 后台检查更新
     * @returns {}
     */
    function admin_checkVer() {
        return request({
            url: host + '/admin/checkVer',
            method: 'post',
            // headers:headers,
            json: true
        }, function (error, response) {
            // Debug(JSON.stringify(response))
            if (error) return sendErr('检查更新失败：' + JSON.stringify(error))
            if (+response.statusCode != 200) return sendErr('检查更新失败A：' + response.body.msg)
            if (response.body.msg) return sendErr('检查更新失败B：' + response.body.msg)

            return response.body
        })
    }

    // 参数说明
    this.config_tips = new Object({ // null
        "username": { type: 'string', name: '管理员账号', tip: '' },
        "password": { type: 'string', name: '管理员密码', tip: '', hide: true },
        "RabbitToken": { type: 'string', name: 'RabbitToken', tip: '', hide: true },
        "ServerHost": { type: 'string', name: 'ServerHost', tip: '' },
        // "MaxTab": {type:'number',name:'同时登录人数',tip:''},
        "CloseTime": { type: 'number', name: '超时回收时间', tip: '' },
        "TJ_username": { type: 'string', name: '图鉴账号', tip: '' },
        "TJ_password": { type: 'string', name: '图鉴密码', tip: '', hide: true },
        "Title": { type: 'string', name: '标题', tip: '' },
        "GitProxy": { type: 'string', name: '拉库更新代理', tip: '' },
        "LoginProxy": { type: 'string', name: '登录代理', tip: '' },
        // "WskeyCronStatus": {type:'boolean',name:'转换Cron状态',tip:''},
        "WskeyCron": { type: 'string', name: '转换Cron', tip: '' },
        "mode": { type: 'number', name: '同步模式', tip: '\n⒈车头模式\n⒉传统模式\n⒊分配模式\n⒋随机容器', ary: ['车头模式', '传统模式', '分配模式', '随机容器'] },
        "SyncCkCronStatus": { type: 'boolean', name: '同步CK状态', tip: '' },
        "SyncCkCron": { type: 'string', name: '同步CK', tip: '' },
        // "CheckCkCronStatus": {type:'boolean',name:'检测CK状态',tip:''},
        "CheckCkCron": { type: 'string', name: '检测ck', tip: '' },
        "BeanCronStatus": { type: 'boolean', name: '资产通知开启状态', tip: '' },
        "BeanCron": { type: 'string', name: '资产通知定时', tip: '' },
        // "REAL_CK": {type:'boolean',name:'复制ck',tip:''},
        "AutoCaptchaCount": { type: 'number', name: '滑动验证次数', tip: '' },
        "WXPUSHER_APP_TOKEN": { type: 'string', name: 'WXPUSHER_APP_TOKEN', tip: '', hide: true },
        "WXPUSHER_UID": { type: 'string', name: 'WXPUSHER_UID', tip: '', hide: true },
        "BotApiToken": { type: 'string', name: '机器人对接Token', tip: '', hide: true }
    })

    return this
}

function img_url2aut(url) {
    // if (!['qb', 'tb', 'tg', 'dd'].includes(imType)) { Debug(`使用原始图片：${url}`); return url }
    Debug(`上传图片到aut：${url}`)
    const img = imageDownload(url, './qrcode.png')

    if (img.success == false) { Debug(`图片读取失败`); return false }
    const ib = encodeURIComponent(img.base64);

    const username = bucketGet("cloud", "username")
    const password = bucketGet("cloud", "password")

    return request({
        url: "http://aut.zhelee.cn/imgUpload",
        method: "post",
        dataType: "json",
        formData: {
            username: username,
            password: password,
            imgBase64: ib
        }
    }, function (error, response) {
        if (error != null) { Debug(`图片上传失败A：${url}\n${JSON.stringify(error)}`); return false }
        if (response.statusCode != 200) { Debug(`图片上传失败B${response.statusCode}：${url}\n${JSON.stringify(response)}`); return false }
        if (response.body?.code != 200) { Debug(`图片上传失败C${response.body?.code}：${url}\n${JSON.stringify(response)}`); return false }

        Debug(`图片上传成功：${response.body.result.path}`)
        return response.body.result.path
    })
}

/** 发送错误提示
 * @description 
 * @param tap 提示内容
 * @returns false
 */
function sendErr(tap) {
    let s = sendText(tap)
    sleep(errTime * 1000)
    RecallMessage(s)
    return false
}

/** 发送提示
 * @description 
 * @param tap 提示内容
 * @returns true
 */
function sendRecall(tap) {
    let s = sendText(tap)
    sleep(recallTime * 1000)
    RecallMessage(s)
    return true
}

/** 用户输入
 * @description 
 * @param tap 提示内容
 * @returns {any}
 */
function ShuRu(tap) {
    let t1 = sendText(tap)
    let s = input(inputTime * 1000, 3000)
    if (s == null || s == '') {
        RecallMessage(t1);
        sendErr(`超时，${inputTime}秒内未回复`)
        return false
    } else if (s == "q" || s == "Q") {
        RecallMessage(t1);
        Debug('用户退出')
        sendErr("已退出会话");
        return false
    } else {
        RecallMessage(t1);
        return s;
    }
}

function tool_QR(text) {
    const url = `https://xiaoapi.cn/API/zs_ewm.php?msg=${text}`
    Debug("url：" + JSON.stringify(url))
    return request({
        url: url,
        method: "get",
        dataType: "json"
    }, function (error, response, header, body) {
        Debug("error：" + JSON.stringify(error))
        Debug("body：" + JSON.stringify(body))
        Debug("response：" + JSON.stringify(response))
    })
}

function context_set(title, key) {
    let msg = `修改${title}\n=====================`
    msg += `\n当前：${bucketGet('RabbitPro', key)}`
    msg += `\n~~~~~~~~~~~~~~~~~~~~~\n请输入你要自定义的${title}：\n》0 默认    》q 退出`
    const sure_success = ShuRu(msg)

    if (/^[oO0]$/.test(sure_success)) { // 恢复默认
        bucketDel('RabbitPro', key)
        return sendRecall(`已恢复默认${title}`)
    } else if (sure_success === false) { // 用户退出
        return false
    } else { // 自定义
        bucketSet('RabbitPro', key, sure_success)
        return sendRecall(`已更新自定义${title}`)
    }
}

main()

Debug('================ End ================')// [description: <a href="https://docs.qq.com/doc/DUHNWRkpQRGZDeml5" title="by justore">查看文档</a><br>RabbitPro 扫码/口令/短信登录<br>首发：20231001]
// [title: RabbitPro]
// [class: 工具类]
// [version: 3.15.4 增加扫码/口令风险提示]
// [price: 2]
// [rule: ^登录$]
// [rule: ^登陆$]
// [bypass: false]
// [priority: 1]
// [public: true]
// [admin: false]
// [disable:false]
// [service: Jusbe]
// [author: jusbe]
// [platform: ALL]
// [param: {"required":true,"key":"RabbitPro.host","bool":false,"placeholder":"如：http://127.0.0.1:5701","name":"RabbitPro 地址","desc":"RabbitPro 的地址"}]
// [param: {"required":true,"key":"RabbitPro.container_name","bool":false,"placeholder":"如：🐇京东上车服务器","name":"RabbitPro 容器","desc":"RabbitPro 中的容器名称<br>使用 Bot 容器请自行配置同步模式/规则"}]
// [param: {"required":true,"key":"RabbitPro.username","bool":false,"placeholder":"如：admin","name":"管理员账号","desc":""}]
// [param: {"required":true,"key":"RabbitPro.password","bool":false,"placeholder":"如：123456","name":"管理员密码","desc":""}]
// [param: {"required":false,"key":"RabbitPro.appToken","bool":false,"placeholder":"如：AT_abcdefg....xyz","name":"wxpusher appToken","desc":"用于微信推送，留空则不启用"}]
// [param: {"required":false,"key":"RabbitPro.title","bool":false,"placeholder":"","name":"顶部标题","desc":"默认使用 RabbitPro 的容器名称"}]
// [param: {"required":false,"key":"RabbitPro.announcement","bool":false,"placeholder":"","name":"底部提示","desc":"默认使用 RabbitPro 的公告内容，支持“一言,笑话,情话,骚话,英文”"}]
// [param: {"required":false,"key":"RabbitPro.expired","bool":false,"placeholder":"","name":"召唤内容","desc":"默认使用 RabbitPro 的过期通知"}]
// [param: {"required":false,"key":"RabbitPro.web","bool":false,"placeholder":"http ...","name":"网页地址","desc":"在主菜单中显示网页登录地址"}]
// [param: {"required":false,"key":"RabbitPro.nothifies","bool":false,"placeholder":"如：qqindiv:123,qqgroup:456,wxgroup:789,tbgroup:111,qbgroup:333","name":"额外通知","desc":"（此功能未开放）留空默认仅通知管理员结果</br>格式：qqindiv:123,qqgroup:456,wxgroup:789"}]
// [param: {"required":false,"key":"RabbitPro.qr_func","bool":false,"placeholder":"默认: 0","name":"取码方式","desc":"目前有 0-2 ，不出码时尝试更改此项"}]

// https://api.03c3.cn/api/qrcode?text=1234asdvgfv23rgwergfweqrfgqewfqwefr323gfrfgwerfg56&m=5&type=jpg&size=30
Debug('\n\n\n\n\n<div style="text-align: center; font-size: 72px; font-weight: bold;">RabbitPro</div>')

const errTime = 6
const inputTime = 60
const recallTime = 60
const timeout = 90
const isDebug = bucketGet('jusapi', 'isDebug') //开启调试内容

const imType = GetImType()
const userId = GetUserID()
const isadmin = isAdmin()
const chatId = GetChatID()
const pluginName = getTitle()
const autHost = bucketGet('RabbitPro', 'autHost');
let web = bucketGet('RabbitPro', 'web'),
    qr_func = bucketGet("RabbitPro", "qr_func") || 0
// Debug(`autman地址：${bucketGet('autMan','host_name')}`)

function main() {
    let container_name = bucketGet('RabbitPro', 'container_name');
    if (!container_name || container_name == '') return sendErr('未配置容器')

    const rabbit = new RabbitPro();if(!rabbit?.config)return sendErr("RabbitPro 连接失败")
    const appToken = rabbit?.config?.WXPUSHER_APP_TOKEN
    const container = rabbit.getContainerByName(container_name); if (!container) return false
    if (container_name == 'Bot') Debug('使用 Bot 容器，请自行在 RabbitPro 后台配置CK同步规则')
    // Debug(JSON.stringify(rabbit.botQR()))
    let title = bucketGet('RabbitPro', 'title'); if (!title) title = container.name;
    let announcement = bucketGet('RabbitPro', 'announcement'); if (!announcement) announcement = '🔔公告：' + rabbit.getAnnouncement();
    if (/一言|笑话|情话|骚话|英文/.test(announcement)) {
        // sendText('💼🌂🎈🎉🎀🎎🎏🎐🎁🎊✅❎❌⭕🔴💣📠💿🎛📷🎥🎚🔍🔎📲📹💰📍🔒💻📻📺📟💾📼📮📭📕📔📝🔔🔌📊🔋📇📑📦📄📃📖📈📉📩📨📒📧📓📙📫📪📗📬📡📯⏰🔮🔭🔬💴💷💶💸💵💳📤📥📜📏📌📐🖇📎📆📁📅🔖📰🚗🥇🥈🥉🎯🎬🏆')
        switch (announcement) {
            case "一言":
                announcement = "📄一言：" + request({ url: "https://api.vvhan.com/api/ian/rand", method: "get" })
                break
            case "笑话":
                announcement = "🎊笑话：" + request({ url: "https://api.vvhan.com/api/text/joke", method: "get" })
                break
            case "情话":
                announcement = "🎈情话：" + request({ url: "https://api.vvhan.com/api/text/love", method: "get" })
                break
            case "骚话":
                announcement = "🎉骚话：" + request({ url: "https://api.vvhan.com/api/text/sexy", method: "get" })
                break
            case "英文":
                announcement = "📜一言：" + request({ url: "https://api.vvhan.com/api/dailyEnglish", method: "get", json: true }).data.en
                break
        }
    }

    const user_uid = getWxPusherByIM()

    //版本更新通知✅❌
    /**
3.15.3
修复配参不显示问题
增加配参设置取码方式，出码异常时尝试更改此项
     */
   // if (isadmin && chatId == 0) {
       // const version = bucketGet("RabbitPro", "version")
      //  const now = getVersion()
      //  if (now != version) {
           // sendText(`RabbitPro v${now}\n\n⒈ ...`)
          //  bucketSet("RabbitPro", "version", now)
      //  }
  //  }

    //定时任务
    if (imType == 'fake') {
        Debug('=====================================')
        Debug('召唤前检测')
        rabbit.containers
            .filter(v => Boolean(v.id - 1) && v.status) // 排除 bot 容器 & 禁用容器
            .forEach((item, index) => Debug(`\n[${index + 1}]${item.name}：转换${rabbit.container_update_all(item.id) ? '✅成功' : '❌失败'}`))
        // .forEach((item, index) => Debug(`\n[${index + 1}]${item.name}：转换${item.status ? rabbit.container_update_all(item.id) ? '✅成功' : '❌失败' : '❌已禁用'}`))
        sleep(60000)

        Debug('定时召唤')
        const ids = new Array()
        rabbit.containers
            .filter(v => {
                if (v.status) return true
                else return Debug(`${v.name}: 容器已禁用，跳过`)
            })
            .forEach(item => {
                const dis_cks = rabbit.getCksByContainer(item.id).filter(v => {
                    return !(v.appck_status || v.mck_status || v.wskey_status)
                })

                dis_cks.forEach(element => {
                    if (!ids.includes(element.pin)) ids.push(element.pin)
                })

                Debug(`[${item.name}]容器找到失效CK：${dis_cks.length} 个${dis_cks.length == 0 ? '，跳过' : ''}`)
            })
        Debug(`所有容器找到 ${ids.length} 个失效CK`)
        ids.forEach(v => { Debug(v) })
        // \n${ids.join('\n')}

        let expired_html = bucketGet("RabbitPro", "expired")
        expired_html = expired_html ? expired_html : rabbit.get_expired_html()
        // {{ pin }}

        const pins = summon(ids, expired_html, '{{ pin }}')

        return notifyMasters(`【${pluginName}】定时召唤结束` + (pins.length ? '：\n' + pins.join('\n') : '：无召唤目标'))
    }

    // 长辈模式
    if (user_uid.phone != '' && user_uid.phone != undefined) {
        Debug(`长辈模式：${user_uid.phone.replace(/(?<=^\d{3})\d{4}/, '****')}，在数据通删除手机号可退出此模式`)
        const tip = sendText(`正在使用 ${user_uid.phone.replace(/(?<=^\d{3})\d{4}/, '****')} 登录京东，请稍等...\n \n${announcement}`)
        const sms_end = rabbit.signInBySMS(container.id, user_uid.phone)
        Debug(`长辈模式：${sms_end.success ? "成功" : "失败"}`)
        if (sms_end.success) {
            sendRecall(`${sms_end.pin} ${sms_end.message}`)
            return RecallMessage(tip)
        } else {
            sendRecall(`${sms_end.message}`)
            return RecallMessage(tip)
        }
    }

    // 普通模式
    let main_str = `${title}${isadmin && chatId == 0 ? '（e1 修改）' : ''}`
    main_str += '\n（请选择登录方式，q 退出）：\n'
    main_str += '=====================\n'
    main_str += '【1】扫码登录\n'
    main_str += '【2】口令登录\n'
    main_str += '【3】短信登录\n'
    main_str += '【4】长辈模式\n'
    if (web) main_str += '【5】网页登录\n'
    main_str += '=====================\n'
    if (appToken) main_str += user_uid.uid ? '🎉推送：已设置（w 修改）\n' : '❌微信推送：未设置（w 设置）\n'
    main_str += `${announcement}${isadmin && chatId == 0 ? '（e2 修改）' : ''}`
    if (isadmin && chatId == 0) {
        main_str += '\n~~~~~~~~~~~~~~~~~~~~~'
        main_str += `\n${rabbit.name}：v${rabbit.version}`
        if (rabbit.version != rabbit.new_version && rabbit.new_version != undefined) main_str += `\n（最新版：${rabbit.new_version}，u 更新）`
        if (imType != 'qb') main_str += `\n✅容器：${rabbit.host}`
        if (imType != 'qb') main_str += `\n${rabbit.admin_TestServerHost(rabbit.config.ServerHost) ? '✅' : '❌'}鉴权：${rabbit.config.ServerHost}`
        main_str += '\n~~~~~~~~~~~~~~~~~~~~~'
        main_str += `\n容器列表（${['车头模式', '传统模式', '分配模式', '随机容器'][rabbit.config.mode - 1]}）：`
        // □■◇◆○●☆★
        // sendText('💼🌂🎈🎉🎀🎎🎏🎐🎁🎊✅❎❌⭕🔴💣📠💿🎛📷🎥🎚🔍🔎📲📹💰📍🔒💻📻📺📟💾📼📮📭📕📔📝🔔🔌📊🔋📇📑📦📄📃📖📈📉📩📨📒📧📓📙📫📪📗📬📡📯⏰🔮🔭🔬💴💷💶💸💵💳📤📥📜📏📌📐🖇📎📆📁📅🔖📰🚗🥇🥈🥉🎯🎬🏆')
        main_str += `\n${rabbit.containers.map((v, i) => { return `》b${i + 1} ${v.status ? v.name == container_name ? '🎯' : '⭕' : '❌'}${v.name}（${rabbit.getCksByContainer(v.id).filter(a => { return a.appck_status || a.mck_status || a.wskey_status }).length}/${rabbit.getCksByContainer(v.id).length}）` }).join('\n')}`
        main_str += '\n~~~~~~~~~~~~~~~~~~~~~'
        main_str += '\n》f 转换     》c 清理     》z 召唤\n》s 配置     》r 重启     》h 帮助'
        // Debug(JSON.stringify(rabbit.getCksByContainer(2)))
    }

    const select = ShuRu(main_str)
    if (select == 1) { // 【1】扫码登录
        Debug('用户选择扫码登录')
        const qr_end = rabbit.signInByQRCode(container.id)
        Debug(`【1】扫码登录：${qr_end.msg}，${qr_end.pin}`)
        if (qr_end == false) return false


        if (user_uid.uid) {
            sendRecall(`${qr_end.pin} ${qr_end.msg}`)
            Debug(`已存在uuid，将同步到RabbitPro：${user_uid.uid}`)
            return rabbit.setCkByPin(container.id, qr_end.pin, 'uuid', user_uid.uid)
        } else if (appToken) {
            const msg_1 = sendText(`${qr_end.pin} ${qr_end.msg}`)
            const uid = getWxPusher(appToken)
            if (!uid) return false

            const status = rabbit.setCkByPin(container.id, qr_end.pin, 'uuid', uid)
            RecallMessage(msg_1)
            return status ? sendRecall(uid + ' 设置成功！') : sendErr(uid + ' 设置失败')
        } else {
            sendRecall(`${qr_end.pin} ${qr_end.msg}`)
        }
    } else if (select == 2) { // 【2】口令登录
        const msg_end = rabbit.signInByQRMsg(container.id)
        Debug(`【2】口令登录：${msg_end.msg}，${msg_end.pin}`)
        if (msg_end == false) return false

        if (user_uid.uid) {
            sendRecall(`${msg_end.pin} ${msg_end.msg}`)
            Debug(`已存在uuid，将同步到RabbitPro：${user_uid.uid}`)
            return rabbit.setCkByPin(container.id, msg_end.pin, 'uuid', user_uid.uid)
        } else if (appToken) {
            const msg_1 = sendText(`${msg_end.pin} ${msg_end.msg}`)

            const uid = getWxPusher(appToken)
            if (!uid) return false

            const status = rabbit.setCkByPin(container.id, msg_end.pin, 'uuid', uid)
            RecallMessage(msg_1)
            return status ? sendRecall(uid + ' 设置成功！') : sendErr(uid + ' 设置失败')
        } else {
            sendRecall(`${msg_end.pin} ${msg_end.msg}`)
        }
    } else if (select == 3) { // 【3】短信登录
        const sms_end = rabbit.signInBySMS(container.id)
        Debug(`【3】短信登录：${sms_end.success ? "成功" : "失败"}`)
        if (sms_end.success == false) return sendErr(sms_end.message)

        if (user_uid.uid) {
            sendRecall(`${sms_end.pin} ${sms_end.message}`)
            Debug(`已存在uuid，将同步到RabbitPro：${user_uid.uid}`)
            return rabbit.setCkByPin(container.id, sms_end.pin, 'uuid', user_uid.uid)
        } else if (appToken) {
            const msg_1 = sendText(`${sms_end.pin} ${sms_end.message}`)

            const uid = getWxPusher(appToken)
            if (!uid) return false

            const status = rabbit.setCkByPin(container.id, sms_end.pin, 'uuid', uid)
            RecallMessage(msg_1)
            return status ? sendRecall(uid + ' 设置成功！') : sendErr(uid + ' 设置失败')
        } else {
            sendRecall(`${sms_end.pin} ${sms_end.message}`)
        }
    } else if (select == 4) { // 【4】长辈模式
        const tip = sendText('此模式为短信登录\n如登录成功，后续给我发登录将不再显示主菜单，直接使用短信登录')
        const sms_end = rabbit.signInBySMS(container.id)
        Debug(`【4】长辈模式：${sms_end.success ? "成功" : "失败"}`)
        if (sms_end.success == false) return sendErr(sms_end.message)
        RecallMessage(tip)

        //存储手机号
        const bucket_str = bucketGet('RabbitPro', 'uids')
        const bucket_data = JSON.parse(bucket_str)
        let isFind = false
        const new_data = bucket_data.map(
            item => {
                if (item[imType] == userId) {
                    item.phone = sms_end.phone
                    isFind = true
                }
                return item
            }
        )
        if (isFind == false) {
            const obj = new Object()
            obj[imType] = userId
            obj.phone = sms_end.phone
            new_data.push(obj)
        }
        bucketSet('RabbitPro', 'uids', JSON.stringify(new_data))

        //
        if (user_uid.uid) {
            sendRecall(`${sms_end.pin} ${sms_end.message}`)
            Debug(`已存在uuid，将同步到RabbitPro：${user_uid.uid}`)
            return rabbit.setCkByPin(container.id, sms_end.pin, 'uuid', user_uid.uid)
        } else if (appToken) {
            const msg_1 = sendText(`${sms_end.pin} ${sms_end.message}`)

            const uid = getWxPusher(appToken)
            if (!uid) return false

            const status = rabbit.setCkByPin(container.id, sms_end.pin, 'uuid', uid)
            RecallMessage(msg_1)
            return status ? sendRecall(uid + ' 设置成功！') : sendErr(uid + ' 设置失败')
        } else {
            sendRecall(`${sms_end.pin} ${sms_end.message}`)
        }
    } else if (select == 5 && web) { // 【5】网页登录
        let cpr = web.match(/(?<=%cpolar\.)(\w+?)(?=%)/img) || new Array()
        if (cpr.length) {
            let cpr_data = JSON.parse(bucketGet("cpolar", "data")) || new Array()
            cpr = cpr.forEach(v => {
                let searchValue = `%cpolar.${v}%`
                let replaceValue = cpr_data.filter(a => { return new RegExp(v, "img").test(a.name) })[0].public_url

                web = web.replace(searchValue, replaceValue)
            })
        }
        Debug(`【5】网页登录：${web}`)
        let msg_5 = `网页登录地址${isadmin && chatId == 0 ? "（e 修改）" : ""}：\n${web}`

        if (isadmin && chatId == 0) {
            let web_edit = ShuRu(msg_5)
            if (/^[eE]$/.test(web_edit)) {
                Debug('=====================================')
                Debug('修改网页登录地址')
                return context_set("网页登录地址", "web")
            }
        } else {
            sendRecall(msg_5)
        }
    } else if (/^[wW]$/.test(select)) { // 设置UID
        Debug('用户选择设置wxpusher')
        if (!appToken) return sendErr('未开启微信推送功能')
        const uid = getWxPusher(appToken)
        if (!uid) return false
        return sendRecall(uid + ' 设置成功！')
    } else if (/^[eE]1$/.test(select) && isadmin && chatId == 0) { // 修改标题
        Debug('=====================================')
        Debug('修改标题')
        return context_set("标题", "title")
    } else if (/^[eE]2$/.test(select) && isadmin && chatId == 0) { // 修改公告
        Debug('=====================================')
        Debug('修改公告')
        return context_set("公告", "announcement")
    } else if (/^[eE]3$/.test(select) && isadmin && chatId == 0) { // 修改召唤内容
        Debug('=====================================')
        Debug('修改召唤内容')
        return context_set("召唤内容", "expired")
    } else if (/^[bB]\d+$/.test(select) && isadmin && chatId == 0) { // 容器管理
        const index = /(?<=^[bB])\d+$/.exec(select)
        Debug('=====================================')
        Debug('容器管理' + index)
        if (index > rabbit.containers.length) return sendErr('输入有误')
        const container = rabbit.containers[index - 1]
        // Debug(JSON.stringify(container))

        let container_config_msg = '容器管理\n'
        container_config_msg += '=====================\n'
        container_config_msg += `⒈容器名称：${container.name}\n`
        container_config_msg += `⒉容器类型：${container.ServerType}\n`
        container_config_msg += `⒊容器地址：${container.url}\n`
        container_config_msg += `⒋Client Id：${container.client_id.replace(/(?<=.{4}).+(?=.{4})/, '****')}\n`
        container_config_msg += `⒌Client Secret：${container.client_secret.replace(/(?<=.{4}).+(?=.{4})/, '****')}\n`
        container_config_msg += `⒍WxPusher：${container.wxpusher_app_token.replace(/(?<=.{4}).+(?=.{4})/, '****')}\n`
        container_config_msg += `⒎容器容量：${container.capacity}\n`
        container_config_msg += `⒏权重：${container.priority}\n`
        container_config_msg += `⒐容器状态：${container.status ? '✅' : '❌'}\n`
        container_config_msg += `⒑备注：${container.description}\n`
        container_config_msg += '~~~~~~~~~~~~~~~~~~~~~\n'
        container_config_msg += '》输入序号修改（,，.。或空格分隔）\n'
        container_config_msg += '》j 配权\n'
        container_config_msg += '》q 退出\n'
        const select2 = ShuRu(container_config_msg)

        if (/^[\.\d，。,\s]+$/.test(select2)) {
            let quit = false
            const container_config_tips = [
                { key: 'name', name: '容器名称', index: 1, type: 'string', tip: '' },
                { key: 'ServerType', name: '容器类型', index: 2, type: 'string', tip: '' },
                { key: 'url', name: '容器地址', index: 3, type: 'string', tip: '' },
                { key: 'client_id', name: 'Client Id', index: 4, type: 'string', tip: '' },
                { key: 'client_secret', name: 'Client Secret', index: 5, type: 'string', tip: '' },
                { key: 'wxpusher_app_token', name: 'WxPusher', index: 6, type: 'string', tip: '' },
                { key: 'capacity', name: '容器容量', index: 7, type: 'number', tip: '' },
                { key: 'priority', name: '权重', index: 8, type: 'number', tip: '' },
                { key: 'status', name: '容器状态', index: 9, type: 'boolean', tip: '' },
                { key: 'description', name: '备注', index: 10, type: 'string', tip: '' }
            ]
            select2.replace(/[\.，。\s]+/g, ',').split(',').forEach(item => {
                if (quit) return false

                const { name, key, type, tip } = container_config_tips[item - 1]

                if (type == 'boolean') {
                    container[key] = !value
                } else {
                    container[key] = ShuRu(`${name}\n=====================\n请输入你的参数：${tip}\n~~~~~~~~~~~~~~~~~~~~~\n》e 留空     》q 退出`)

                    // throw new Error('')
                    if (container[key] == false) return quit = true
                    if (container[key] == 'e' || container[key] == 'E') container[key] = ''
                    if (type == 'number') container[key] = +container[key]
                }
                Debug(`${name}：${container[key]}`)
                // Debug(`提交表单：${JSON.stringify(container)}`)
            })
            if (quit) return false

            return sendErr("容器管理: " + rabbit.containerUpdate(container).msg)
        } else if (/^[jJ]$/.test(select2)) {
            Debug('配置权重')
            const cks = rabbit.getCksByContainer(container.id).sort((a, b) => { return b.priority - a.priority })
            const showNum = 10
            let page = 0

            do {
                let ckmanage_content = '配置权重\n'
                ckmanage_content += '=====================\n'
                ckmanage_content += cks.slice(page * showNum, page * showNum + showNum).map((v, i) => { return `[${i + page * showNum + 1}]${(v.appck_status || v.mck_status || v.wskey_status) ? '✅' : '❌'}${decodeURI(v.pin)}（${v.priority}）` }).join('\n')
                ckmanage_content += '\n~~~~~~~~~~~~~~~~~~~~~\n'
                ckmanage_content += '》输入序号设置权重（,，.。或空格分隔）\n'
                if (page != 0) ckmanage_content += '》u 上页\n'
                if ((page + 1) < cks.length / showNum) ckmanage_content += '》n 下页\n'
                ckmanage_content += '》q 退出\n'

                const select3 = ShuRu(ckmanage_content)
                if (/^[\.\d，。,\s]+$/.test(select3)) {
                    const priority = ShuRu('请输入权重（q 退出）：')
                    if (/^\d+$/.test(priority)) {
                        select3.replace(/[\.，。\s]+/g, ',').split(',').forEach(item => {
                            cks[item - 1].priority = priority
                            Debug(`【${item}】${cks[item - 1].remarks}（ID：${cks[item - 1].id}）配权：${cks[item - 1].priority}`)
                            rabbit.setCkById(cks[item - 1])
                        })
                    } else if (priority == false) {
                        return false
                    } else {
                        return sendErr('输入有误')
                    }
                } else if (/^[uU]$/.test(select3) && page != 0) {
                    page--
                } else if (/^[nN]$/.test(select3) && (page + 1) < cks.length / showNum) {
                    page++
                    // sendText(JSON.stringify(cks.slice(page * showNum, page * showNum + showNum)))
                } else if (select3 == false) {
                    return false
                } else {
                    return sendErr('输入有误')
                }
            } while (true)
        } else if (select2 == false) {
            return false
        } else {
            return sendErr('输入有误')
        }
    } else if (/^[fF]$/.test(select) && isadmin && chatId == 0) { // 转换ck
        Debug('=====================================')
        Debug('转换ck')
        sendErr("正在更新CK，请稍后查看")
        let msg_c = '转换ck\n====================='

        rabbit.containers
            .filter(v => Boolean(v.id - 1) && v.status) // 排除 bot 容器 & 禁用容器
            .forEach((item, index) => { msg_c += `\n[${index + 1}]${item.name}：转换${rabbit.container_update_all(item.id) ? '✅成功' : '❌失败'}` })
        // .forEach((item, index) => { msg_c += `\n[${index + 1}]${item.name}：转换${item.status ? rabbit.container_update_all(item.id) ? '✅成功' : '❌失败' : '❌已禁用'}` })

        return sendRecall(msg_c)
    } else if (/^[cC]$/.test(select) && isadmin && chatId == 0) { // 清理ck
        Debug('=====================================')
        Debug('清理失效账号')
        const sure_msg = '清理ck\n=====================\n此操作将删除所有容器中的失效ck\n~~~~~~~~~~~~~~~~~~~~~\n》y 确认     》q 退出'
        const sure_success = ShuRu(sure_msg)
        if (sure_success == false) return false

        let O_0 = new Array()
        rabbit.containers.forEach(item => {
            const dis_cks = rabbit.getCksByContainer(item.id).filter(v => {
                return !(v.appck_status | v.mck_status | v.wskey_status)
            })
            Debug(`[${item.name}]容器找到失效CK：${dis_cks.length} 个${dis_cks.length == 0 ? '，跳过' : ''}`)
            if (dis_cks.length == 0) {
                return false
            } else {
                O_0 = O_0.concat(dis_cks.map(a => { return a.pin }))
                rabbit.env_delete(item.id, dis_cks.map(a => { return a.id }).join(','))
            }
        })
        O_0 = [...new Set(O_0)]
        O_0.forEach(v => { Debug(`删除失效账号：${O_0[v]}`) })
        return sendRecall('清理结束：' + (O_0.length ? '\n' + O_0.join('\n') : '无失效账号'))
    } else if (/^[zZ]$/.test(select) && isadmin && chatId == 0) { // 召唤
        Debug('=====================================')
        Debug('召唤失效账号')
        const sure_msg = '召唤\n=====================\n此操作将在所有平台通知账号失效的用户\n~~~~~~~~~~~~~~~~~~~~~\n》e3 自定义召唤内容\n》y 确认\n》q 退出'
        const sure_success = ShuRu(sure_msg)

        if (/^[yY]$/.test(sure_success)) { // 召唤
            Debug('召唤前检测')
            rabbit.containers
                .filter(v => Boolean(v.id - 1) && v.status) // 排除 bot 容器 & 禁用容器
                .forEach((item, index) => Debug(`\n[${index + 1}]${item.name}：转换${rabbit.container_update_all(item.id) ? '✅成功' : '❌失败'}`))
            // rabbit.containers.forEach((item, index) => Debug(`\n[${index + 1}]${item.name}：转换${item.status ? rabbit.container_update_all(item.id) ? '✅成功' : '❌失败' : '❌已禁用'}`))
            sleep(60000)

            Debug('手动召唤')
            const ids = new Array()
            rabbit.containers.forEach(item => {
                const dis_cks = rabbit.getCksByContainer(item.id).filter(v => {
                    return !(v.appck_status | v.mck_status | v.wskey_status)
                })

                dis_cks.forEach(element => {
                    if (!ids.includes(element.pin)) ids.push(element.pin)
                })

                Debug(`[${item.name}]容器找到失效CK：${dis_cks.length} 个${dis_cks.length == 0 ? '，跳过' : ''}`)
            })
            Debug(`所有容器找到 ${ids.length} 个失效CK`)
            // \n${ids.join('\n')}

            let expired_html = bucketGet("RabbitPro", "expired")
            expired_html = expired_html ? expired_html : rabbit.get_expired_html()
            // {{ pin }}

            const pins = summon(ids, expired_html, '{{ pin }}')

            return sendRecall('通知结束' + (pins.length ? '\n' + pins.join('\n') : ''))
        } else if (/^[eE]3$/.test(sure_success)) { // 修改召唤内容
            Debug('=====================================')
            Debug('修改召唤内容')
            return context_set("召唤内容", "expired")
        } else if (sure_success == false) { // 用户退出
            return false
        } else { // 输入有误
            return sendErr('输入有误！')
        }
    } else if (/^[sS]$/.test(select) && isadmin && chatId == 0) { // 配置
        Debug('=====================================')
        Debug('配置')
        const values = new Array()
        for (let a in rabbit.config_tips) {
            values.push({ ...rabbit.config_tips[a], ...{ key: a, value: rabbit.config[a] } })
        }

        // Debug(JSON.stringify(values))
        const config_select = ShuRu(`\
        配置文件\
        \n=====================\
        \n${values.map((v, i) => {
            let s = '【' + (i + 1) + '】' + v.name + '：'
            if (Array.isArray(v.ary)) {
                s += v.ary[v.value - 1]
            } else if (v.hide) {
                s += '***'
            } else if (v.value == null) {
                s += ''
            } else if (v.type == 'boolean') {
                s += v.value ? '✅' : '❌'
            } else {
                s += v.value
            }
            return s
        }).join('\n')}\
        \n~~~~~~~~~~~~~~~~~~~~~\
        \n》输入序号修改（,，.。或空格分隔）\
        \n》q 退出`)

        if (config_select == false) return false
        if (/\d+[,\d]*/.test(config_select) == false) return sendErr('输入有误')

        let quit = false
        config_select.replace(/[\.，。\s]+/g, ',').split(',').forEach(item => {
            if (quit) return false

            const { name, key, value, type, tip } = values[item - 1]

            if (type == 'boolean') {
                rabbit.config[key] = !value
            } else {
                rabbit.config[key] = ShuRu(`${name}\n=====================\n请输入你的参数：${tip}\n~~~~~~~~~~~~~~~~~~~~~\n》e 留空     》q 退出`)

                // throw new Error('')
                if (rabbit.config[key] == false) return quit = true
                if (rabbit.config[key] == 'e' || rabbit.config[key] == 'E') rabbit.config[key] = ''
                if (type == 'number') rabbit.config[key] = +rabbit.config[key]
            }
            Debug(`${name}：${rabbit.config[key]}`)
            // Debug(`提交表单：${JSON.stringify(rabbit.config)}`)
        })
        if (quit) return false

        const result = rabbit.admin_SaveConfig(rabbit.config)
        // Debug(JSON.stringify(result))
        if (result.success) {
            bucketSet('RabbitPro', 'appToken', rabbit.config.WXPUSHER_APP_TOKEN)
            bucketSet('RabbitPro', 'username', rabbit.config.username)
            bucketSet('RabbitPro', 'password', rabbit.config.password)
        }
        return sendRecall(result.msg)
    } else if (/^[rR]$/.test(select) && isadmin && chatId == 0) { // 重启
        Debug('=====================================')
        Debug('重启RabbitPro')
        const sure_msg = '重启\n=====================\n此操作将重启RabbitPro，短时间内不可用\n~~~~~~~~~~~~~~~~~~~~~\n》y 确认     》q 退出'
        const sure_success = ShuRu(sure_msg)
        if (sure_success == false) return false
        rabbit.admin_restart()
        return sendRecall('重启中，请稍后查看')
    } else if (/^[uU]$/.test(select) && isadmin && chatId == 0) { // 更新
        Debug('=====================================')
        Debug('更新RabbitPro')
        const sure_msg = '更新\n=====================\n此操作将更新RabbitPro，短时间内不可用\n~~~~~~~~~~~~~~~~~~~~~\n》y 确认     》q 退出'
        const sure_success = ShuRu(sure_msg)
        if (sure_success == false) return false
        rabbit.admin_update()
        return sendRecall('更新中，请稍后查看')
    } else if (/^[hH]$/.test(select) && isadmin && chatId == 0) { // 插件反馈
        let faq = "FAQ\n====================="
        faq += "\nQ：频道不显示二维码\nA：检查图片尺寸是否过大、检查图片转链地址（参考autman论坛频道配置教程）\n "
        faq += "\nQ：所有平台不显示二维码，日志或后台显示“/tmp/static/3e1e76f2....jpg”\nA：在 autman后台-系统管理-系统参数-基本 中设置“域名或公网地址”（autman本地地址即可）\n "
        faq += "\nQ：反代：\nA：mr.118918.xyz\nmr.5gyh.com\nhost.257999.xyz\nlog.madrabbit.eu.org\nmr.yanyuwangluo.cn:1202\nfd.gp.mba:6379\nmr.108168.xyz:10188\nrabbit.gushao.club"
        faq += "\n====================="
        faq += "\n联系作者（找群主）：\nQbot：1149678901\nVbot：jusbotman\n请优先自行尝试或咨询网友"
        return sendRecall(faq)
    } else if (select == false) { // 用户退出
        return false
    } else { // 输入有误
        return sendErr('输入有误！')
    }
}

/** 召唤，通过pinxx查询并推送
 * @param {array} ids 
 */
function summon(ids = new Array(), content = '', param = '') {
    const buckets = ['pinQB', 'pinQQ', 'pinWX', 'pinWB', 'pinTG', 'pinTB']
    const pins = new Array()
    ids.forEach(pin => {
        let O_0 = new Array()
        buckets.forEach(bucket => {
            const _userid = bucketGet(bucket, pin)
            if (_userid == '') return

            const msg = content.replace(param, pin)
            const im = bucket.slice(3).toLowerCase()
            O_0.push(im)

            sleep(1000)
            push(
                {
                    imType: im,
                    userID: _userid,
                    content: msg,
                }
            )

            pins.push(pin)
        })
        O_0.length ? Debug(`${pin} 通知成功：${O_0.join('、')}`) : Debug(`${pin} 未找到绑定社交账号`)
    })
    return [...new Set(pins)]
}

/** IM获取wxpusher */
function getWxPusherByIM() {
    const bucket_data = bucketGet('RabbitPro', 'uids')
    let uids
    if (bucket_data == '') {
        uids = new Array() //未赋值时初始化
    } else {
        uids = JSON.parse(bucket_data)
    }
    let user_data = uids.filter(item => { return item[imType] == userId })

    // Debug(typeof(uids))
    // Debug(JSON.stringify(uids))
    if (user_data.length == 0) {
        new_data = new Object()
        new_data[imType] = userId
        new_data.uid = ''
        // uids.push(user_data)
        // bucketSet('RabbitPro','uids',JSON.stringify(uids))
        return new_data
    } else {
        return user_data[0]
    }
}

/** IM设置wxpusher */
function setWxPusherByIM(uid) {
    const bucket_data = bucketGet('RabbitPro', 'uids')
    let uids
    if (bucket_data == '') {
        uids = new Array() //未赋值时初始化
    } else {
        uids = JSON.parse(bucket_data)
    }
    let uid_data = uids.filter(item => { return item.uid == uid })
    if (uid_data.length) { // 有旧UID时在旧数据更新 im / userid
        Debug(uid + ' 更新IM：' + userId)
        uids = uids.map(v => {
            if (v.uid == uid) v[imType] = userId
            return v
        })
        bucketSet('RabbitPro', 'uids', JSON.stringify(uids))
        return uids
    }

    // 无旧UID处理
    let user_data = uids.filter(item => { return item[imType] == userId })
    if (user_data.length == 0) { // 且无旧用户时，新增数据
        Debug(userId + ' 新增wxpusher：' + uid)
        user_data = new Object()
        user_data[imType] = userId
        user_data.uid = uid
        uids.push(user_data)
        bucketSet('RabbitPro', 'uids', JSON.stringify(uids))
        return uids
    } else { // 有旧用户时更新 uid
        Debug(userId + ' 更新wxpusher：' + uid)
        uids.map(item => {
            if (item[imType] == userId) {
                item.uid = uid
            }
            return item
        })
        bucketSet('RabbitPro', 'uids', JSON.stringify(uids))
        return uids
    }
}

/** 申请 wxpusher */
function getWxPusher(appToken) {
    const url = 'https://wxpusher.zjiecode.com/api/fun/create/qrcode'
    const extra = {}
    extra[imType] = userId
    return request({
        url: url,
        method: 'post',
        body: {
            appToken: appToken,
            extra: JSON.stringify(extra),
            validTime: inputTime
        }
    }, function (error, response) {
        if (error) return sendErr(error)
        if (response.statusCode != 200) return sendErr('二维码获取失败')
        // Debug(response.body)

        const body = JSON.parse(response.body)
        if (!body.success) return sendErr('二维码获取失败\n' + body.msg)

        return checkWxPusher(body.data.code, body.data.url)
    })
}

/** 检测 wxpusher */
function checkWxPusher(code, img_url) {
    const url = 'https://wxpusher.zjiecode.com/api/fun/scan-qrcode-uid'
   // const img = img_url2aut(img_url)
    const img = img_url
    const msg_2 = sendText(`请在 ${inputTime} 秒内使用微信扫码关注应用（q 退出）：${image(img)}`)
    // const msg_1 = imType == 'qb' ? sendText(img_url) : sendImage(img_url)

    const time = 15
    for (let i = time; i < inputTime; i += time) {
        const quit = input(time * 1000, 3000)
        const result = request({
            url: url + '?code=' + code,
            method: 'get'
        }, function (error, response) {
            // Debug('checkWxPusher: '+JSON.stringify(response))
            if (error) return false
            if (response.statusCode != 200) return false

            const body = JSON.parse(response.body)

            // sendText(i)
            // sendText(response.body)
            // sendText('checkWxPusher: '+JSON.stringify(body.data))

            if (body.success) {
                setWxPusherByIM(body.data)
                return body.data
            } else {
                return false
            }
        })

        if (result) return result
        if (quit == 'q' || quit == 'Q') {
            RecallMessage(msg_2)
            return false
        }
    }
}

/**** RabbitPro ****
 * @description RabbitPro 容器管理
 * @param returns {any}
 */
function RabbitPro() {
    const host = bucketGet('RabbitPro', 'host');
    const access_token = bucketGet('RabbitPro', 'access_token');
    const headers = {
        "Authorization": 'Bearer ' + access_token,
        "User-Agent": "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.139 Mobile Safari/537.36",
        "Cookie": "autMan=RabbitPro=plugin=by=jusbe="
    }

    //旧板兼容
    // const Authorization = bucketGet('RabbitPro', 'Authorization');
    // if (Authorization != Authorization) headers.Authorization = Authorization

    const container_body = container_get()
    if (!container_body) headers.Authorization = 'Bearer ' + admin_auth().access_token
    else if (container_body.code == 401) headers.Authorization = 'Bearer ' + admin_auth().access_token
    this.containers = container_get()

    const ver = admin_ver()
    this.new_version = admin_checkVer().version
    this.version = ver.version
    this.name = ver.name
    this.host = host
    this.config = admin_GetConfig()

    // test
    // request({
    //     url:host,
    //     method:"get",
    //     json:true
    // },function(error,response,header,body,Cookie){
    //     sendText(`error：${JSON.stringify(error)}`)
    //     sendText(`response：${JSON.stringify(response)}`)
    //     sendText(`header：${JSON.stringify(header)}`)
    //     sendText(`body：${JSON.stringify(body)}`)
    //     sendText(`Cookie：${JSON.stringify(Cookie)}`)
    // })

    /** 扫码登录
     * @description 
     * @param container_id RabbitPro 容器编号
     * @returns {any}
     */
    this.signInByQRCode = function (container_id) {
        const qr_data = (container_id == 1 ? this.botGenQrCode() : this.getQR())
        if (qr_data == false) return false
        if (!qr_data.qr || qr_data.qr == '') return sendErr('获取二维码失败')

        let qr_link = 'https://qr.m.jd.com/p?k=' + qr_data.QRCodeKey
        Debug('登录链接：' + qr_link)
        // if (img.startsWith("/tmp/static/")) img = "http://127.0.0.1:8080" + img  // autHost + img
        //在 系统参数-基本-域名或公网地址 中设置autHost
        img = qr_func == "1" ? `https://api.03c3.cn/api/qrcode?text=${qr_link}&m=5&type=jpg&size=30` :
            qr_func == "2" ? encodeQR(qr_link, 512) :
                img_url2aut(encodeQR(qr_link, 512))
        Debug('二维码地址：' + img)

        const msg = sendText(`请在 ${timeout} 秒内使用京东app${imType == 'qq' || imType == 'qb' ? '或者QQ扫码(支持长按识别)' : ''}进行登录（q 退出）：${image(img)}`)
        // sendImage('https://qn12.tool.lu/c4ca4238a0b923820dcc509a6f75849b_200x200.png')
        // sendImage(img)

        const check_time = 5
        for (let i = check_time; i < timeout; i += check_time) {
            const quit = input(check_time * 1000, 3000)
            if (quit == 'q' || quit == 'Q') {
                return sendErr('退出')
            } else {
                const user_data = container_id == 1 ? this.botQrCheck({ QRCodeKey: qr_data.QRCodeKey }) : this.checkQR({ QRCodeKey: qr_data.QRCodeKey, container_id: container_id })
                if (user_data == false) return false
                Debug(i+' signInByQRCode: '+JSON.stringify(user_data))
                if (user_data.code == 200) {
                    RecallMessage(msg)
                    this.linkPin(user_data.pin)
                    return user_data
                } else if (user_data.code == 54) {
                    RecallMessage(msg)
                    return sendErr(user_data.msg)
                } else if (user_data.code == 56 || user_data.code == 57) {
                    continue
                } else {
                    // Debug(false)
                    RecallMessage(msg)
                    RecallMessage(JSON.stringify(user_data))
                    return sendErr(`${user_data.code?user_data.code+": ":""}${user_data?.msg || '扫码验证失败'}`)
                   // return sendErr(user_data?.msg || '扫码验证失败')
                }
            }
        }
        RecallMessage(msg)
        return sendErr('超时')
    }

    /** 口令登录
     * @description 
     * @param container_id RabbitPro 容器编号
     * @returns {any}
     */
    this.signInByQRMsg = function (container_id) {
        const qr_data = (container_id == 1 ? this.botGenQrCode() : this.getQR())
        if (qr_data == false) return false
        if (!qr_data.jcommond || qr_data.jcommond == '') return sendErr('获取口令失败')

        const msg = sendText(`请在 ${timeout} 秒内复制口令到京东APP登录（q 退出）`)
        const jcommond = sendText(qr_data.jcommond)

        const check_time = 5
        for (let i = check_time; i < timeout; i += check_time) {
            const quit = input(check_time * 1000, 3000)
            if (quit == 'q' || quit == 'Q') {
                return sendErr('退出')
            } else {
                const user_data = (container_id == 1 ? this.botQrCheck({ QRCodeKey: qr_data.QRCodeKey }) : this.checkQR({ QRCodeKey: qr_data.QRCodeKey, container_id: container_id }))
                if (user_data == false) return false
                Debug(i + ' signInByQRCode: ' + JSON.stringify(user_data))
                if (user_data.code == 200) {
                    RecallMessage(jcommond)
                    RecallMessage(msg)
                    this.linkPin(user_data.pin)
                    return user_data
                } else if (user_data.code == 54) {
                    RecallMessage(jcommond)
                    RecallMessage(msg)
                    return sendErr(user_data.msg)
                } else if (user_data.code == 56 || user_data.code == 57) {
                    continue
                } else {
                    // Debug(false)
                    RecallMessage(jcommond)
                    RecallMessage(msg)
                    return sendErr(`${user_data.code?user_data.code+": ":""}${user_data?.msg || '口令验证失败'}`)
                   // return sendErr(user_data?.msg || '口令验证失败')
                }
            }
        }
        RecallMessage(msg)
        return sendErr('超时')
    }

    /** 获取二维码/口令
     * @description 
     * @returns {any}
     */
    this.getQR = function () {
        return request({
            url: host + '/api/GenQrCode',
            method: 'post',
            body: {},
            json: true
        }, function (error, response) {
            // Debug('getQRCode: '+JSON.stringify(response.body))
            if (error) return sendErr(JSON.stringify(error))
            if (+response.statusCode != 200) return sendErr('获取二维码失败A：\n' + response.body.description + '\n' + response.body.message)
            if (+response.body.code != 0) return sendErr('获取二维码失败B：' + response.body.msg)

            // Debug('getQRCode: '+JSON.stringify(response.body))
            return response.body
            // {
            //     "qr":"iVBORw0KGgoAAAANSUhEUgAAAMQAAADEAQAAAADo3bPGAAACQElEQVR4nLWYwXEDMQwD2QH775IdMMRC9idf+DIX32k9I1GCSMhVVV07M9tV03rVk68g6d3mrlraZkoNcXKferjG3qm9a+5r/QtSCrXU6cFZBf0b4hB5mZ79CblPhVejCb2BzPR+5zpHJIV/11c7OULvmlEt4N0XqVbyLWKOSA4I/oIsdFLrIYTJLVZJHQs4eah7fS9L6HLQ+ZSlP8UeDpPWEyORAoeccUqZNFmm9XouNpdWbF9mSpJZBarYRow/Ld2kyaCJUeeaTEag6MOkUbyzhHpehY4Ws4RZ/IpDOtELks8S6pFSnsJtLyG7LEt2CGwsw33FouOEHCHxLclViYlkGyesHvOo9nr7VzkkSk4TS4MzoPOEdBkmJB/NJrK8tmlXpTBRFUfxUkczr5pPaSRKXkVXmmDRXkncNCl3vN7BLhg3gk4TzSiJ230+Z+R0ESVbryyR0rVuWL0JE0eL2jFCCtjpL0uQN8pwzOp8Jf4wuX/lyLCpckQyEwwrSRQedp58tHgv74IsseXC05EDx2kvToZy1E+QGEh5/IoTVQlnWdlvdrLdXpbg65hRvHbj8+vl3iBRyWCttGIGPo/FydrMYYI/I6CmRwl7ChPE2bWdZucNIEgkw9e3XsYNeOQkoc3W+3N9jmZRwglMyOdX/8awnGKihIKnRRsb13EFrDTROWXaJX2dBx18mlCIumxbGcD6zhPtIwYj97U4ypofEE5gFFuOrey3ShNZ7mVa20ljKIsTJtY8Bz7/ZjZOUpUlf7WER7F62bNlAAAAAElFTkSuQmCC",
            //     "jcommond":"16:/￥EEnwC90OM0O￥，⇢Jℹng◧菄Rabbit",
            //     "code":0,
            //     "msg":"",
            //     "token":"",
            //     "QRCodeKey":"AAEAINdY3CuGJccQaljifxDYOmAxbdCw0rxkhTdY7IQLowcT"
            // }
        })
    }

    /** 二维码/口令验证
     * @description 检查扫码/口令结果
     * @param QRCodeKey 用户识别码，由 getQRCode 获取
     * @param container_id RabbitPro 容器编号，由 Config() 获取
     * @param token RabbitPro BotApiToken 无用可不填
     */
    this.checkQR = function (body = { QRCodeKey, container_id: 2, token }) {
        return request({
            url: host + '/api/QrCheck',
            method: 'post',
            body: body,
            json: true
        }, function (error, response) {
            // Debug('checkQRCode: '+JSON.stringify(response.body))
            if (error) return sendErr(JSON.stringify(error))
            if (+response.statusCode != 200) return sendErr('验证二维码/口令失败A：\n' + response.body.description + '\n' + response.body.message)

            // Debug('checkQRCode: '+JSON.stringify(response.body))
            return response.body
        })
    }

    /** 短信登录
     * @description 
     * @param container_id RabbitPro 容器编号
     * @returns {any}
     */
    this.signInBySMS = function (container_id, phone = '') {
        const Phone = phone ? phone : ShuRu('请输入您的手机号（q 退出）：')
        // sendText(Phone)
        if (Phone == false) return { success: false, message: "未输入手机号" }
        if (!/^1\d{10}$/.test(Phone)) return { success: sendErr('手机号格式错误'), message: "未输入手机号" }

        let tip = sendText('正在获取验证码...')
        let get_sms = (container_id == 1 ? this.botSendSMS(Phone) : this.getSMS(Phone, container_id))
        // Debug(JSON.stringify(get_sms))
        // {"success":true,"message":"","data":{"status":505},"code":505}
        if (get_sms.success == undefined) return sendErr(JSON.stringify(get_sms))

        RecallMessage(tip)
        for (let i = 0; i < 5; i++) {
            if (get_sms.success) {
                break
            } else {
                Debug(`第 ${i + 1} 次重试`)
                get_sms = this.AutoCaptcha(Phone)
                sleep(5000)
            }
        }

        if (get_sms.success == false) {
            sendErr(`[code: ${get_sms.code}]${get_sms.data.status} - ${get_sms.message}`)
            return { ...get_sms, ...{ message: get_sms.message } }
        }

        const Code = ShuRu('请输入您的验证码（q 退出）：')
        if (Code == false) return { success: false, message: "" } // 取消 或 未输入验证码
        if (!/^\d+$/.test(Code)) return { success: false, message: "验证码格式错误" }

        const user_data = (container_id == 1 ? this.botVerifyCode(+Phone, Code) : this.serifySMS(+Phone, Code, container_id))
        if (user_data == false) return { success: false, message: user_data.message }
        // Debug('signInBySMS: '+JSON.stringify(user_data))
        this.linkPin(user_data.pin)
        user_data.phone = Phone
        return { ...user_data, ...{ success: true } }
    }

    /** 获取短信验证码
     * @description 
     * @param Phone 手机号
     * @param container_id RabbitPro 容器编号
     * @returns {any}
     */
    this.getSMS = function (Phone, container_id) {
        // sendText(Phone)
        return (
            request({
                url: host + '/sms/sendSMS',
                method: 'post',
                headers: headers,
                body: {
                    Phone: Phone,
                    container_id: container_id
                },
                json: true
            }, function (error, response, headers, body) {
                Debug(`sendSMS 获取短信验证码: ${JSON.stringify(body)}`)
                if (error) return { success: false, message: JSON.stringify(error) }
                // if(+response.statusCode != 200) return sendErr('获取短信验证码失败A：\n'+response.body.description+'\n'+response.body.message)
                // if(+response.body.code != 505) return sendErr('获取短信验证码失败B：'+response.body.msg)

                // Debug('getSMS: '+JSON.stringify(response.body))

                // if (!body.success) {
                //     for (let i = 0; i < 5; i++) {
                //         // sendText(JSON.stringify(this.get_sms))
                //         if (body.success) return body
                //         else {
                //             Debug(`第 ${i + 1} 次重试`)
                //             body = this.AutoCaptcha(Phone)
                //             sleep(5000)
                //         }
                //     }
                // }

                return body
            })
        )
    }

    /** 获取短信验证码-过验证
     * @description 
     * @param Phone 手机号
     * @param container_id RabbitPro 容器编号
     * @returns {any}
     */
    this.AutoCaptcha = function (Phone) {
        // sendText(Phone)
        return (
            request({
                url: host + '/sms/AutoCaptcha',
                method: 'post',
                headers: headers,
                body: {
                    Phone: Phone
                },
                json: true
            }, function (error, response, headers, body) {
                Debug(`AutoCaptcha 过验证: ${response.body.success}`)
                if (error) return Debug(JSON.stringify(error))
                // if(+response.statusCode != 200) return Debug('获取短信验证码失败A：\n'+response.body.description+'\n'+response.body.message)
                // if(+response.body.code != 505) return Debug('获取短信验证码失败B：'+response.body.msg)
                return body
            })
        )
    }

    /** 短信验证
     * @description 
     * @param Phone 手机号
     * @param Code 验证码
     * @param container_id RabbitPro 容器编号，由 Config() 获取
     * @returns {any}
     */
    this.serifySMS = function (Phone, Code, container_id) {
        return (
            request({
                url: host + '/sms/VerifyCode',
                method: 'post',
                body: {
                    Phone: Phone,
                    Code: Code,
                    container_id: container_id
                },
                json: true
            }, function (error, response) {
                Debug('serifySMS 验证码验证: ' + JSON.stringify(response.body))
                if (error) return sendErr(JSON.stringify(error))
                if (+response.statusCode != 200) return sendErr('短信验证失败A：' + response.body.message)
                if (+response.body.code != 200) return sendErr('短信验证失败B：' + response.body.message)

                // Debug('serifySMS: '+JSON.stringify(response.body))
                return response.body
                // {"success":true,"code":200,"message":"登陆成功","pin":"jd_65cd1167c450b","container_id":2,"user_index":"5f2111c4dcf848ed88050cdef14fa61d"}
            })
        )
    }

    /** bot获取二维码/口令
     * @description 
     * @param {string} BotApiToken
     * @returns {any}
     */
    this.botGenQrCode = function () {
        return request({
            url: host + '/bot/GenQrCode?BotApiToken=' + this.config.BotApiToken,
            method: 'post',
            body: {},
            json: true
        }, function (error, response) {
            // Debug('getQRCode: '+JSON.stringify(response.body))
            if (error) return sendErr(JSON.stringify(error))
            if (+response.statusCode != 200) return sendErr('BOT获取二维码失败A：\n' + response.body.description + '\n' + response.body.message)
            if (+response.body.code != 0) return sendErr('BOT获取二维码失败B：' + response.body.msg)

            // Debug('getQRCode: '+JSON.stringify(response.body))
            return response.body
        })
    }

    /** bot二维码/口令验证
     * @description 检查扫码/口令结果
     * @param QRCodeKey 用户识别码，由 getQRCode 获取
     */
    this.botQrCheck = function (body = { QRCodeKey }) {
        return request({
            url: host + '/bot/QrCheck?BotApiToken=' + this.config.BotApiToken,
            method: 'post',
            body: body,
            json: true
        }, function (error, response) {
            // Debug('checkQRCode: '+JSON.stringify(response.body))
            if (error) return sendErr(JSON.stringify(error))
            if (+response.statusCode != 200) return sendErr('BOT验证二维码/口令失败A：\n' + response.body.description + '\n' + response.body.message)

            // Debug('checkQRCode: '+JSON.stringify(response.body))
            return response.body
        })
    }

    /** bot获取短信验证码
     * @description 
     * @param Phone 手机号
     * @returns {any}
     */
    this.botSendSMS = function (Phone) {
        return (
            request({
                url: host + '/bot/mck/sendSMS?BotApiToken=' + this.config.BotApiToken,
                method: 'post',
                body: {
                    Phone: Phone
                },
                json: true
            }, function (error, response) {
                // Debug('getSMS: '+JSON.stringify(response.body))
                if (error) return sendErr(JSON.stringify(error))
                if (+response.statusCode != 200) return sendErr('BOT获取短信验证码失败A：\n' + response.body.description + '\n' + response.body.message)
                if (+response.body.code != 505) return sendErr('BOT获取短信验证码失败B：' + response.body.msg)

                // Debug('getSMS: '+JSON.stringify(response.body))
                return true
            })
        )
    }

    /** bot短信验证
     * @description 
     * @param Phone 手机号
     * @param Code 验证码
     * @returns {any}
     */
    this.botVerifyCode = function (Phone, Code) {
        return (
            request({
                url: host + '/bot/mck/VerifyCode?BotApiToken=' + this.config.BotApiToken,
                method: 'post',
                body: {
                    Phone: Phone,
                    Code: Code
                },
                json: true
            }, function (error, response) {
                // Debug('serifySMS: '+JSON.stringify(response.body))
                if (error) return sendErr(JSON.stringify(error))
                if (+response.statusCode != 200) return sendErr('BOT短信验证失败A：' + response.body.msg)
                if (+response.body.code != 200) return sendErr('BOT短信验证失败B：' + response.body.msg)

                // Debug('serifySMS: '+JSON.stringify(response.body))
                return response.body
                // {"success":true,"code":200,"message":"登陆成功","pin":"jd_65cd1167c450b","container_id":2,"user_index":"5f2111c4dcf848ed88050cdef14fa61d"}
            })
        )
    }

    /** 由 container_get 获取指定名字容器
     * @description 
     * @param name RabbitPro 容器名称
     * @returns {any}
     */
    this.getContainerByName = function (name) {
        if (Array.isArray(this.containers)) {
            if (this.containers.length) {
                const container = this.containers.filter(item => {
                    return item.name == name
                })
                if (container.length) {
                    // Debug('getContainerByName: '+JSON.stringify(container[0]))
                    Debug('获取容器成功：' + container[0].name)
                    return container[0]
                }
            }
        }
        return sendErr('获取容器失败')
    }

    /** 由 RabbitPro后台-容器管理 编辑容器配置
     * @description 
     * @param {object} body
     * @returns {any}
     */
    this.containerUpdate = function (body) {
        return request({
            url: host + '/container/update',
            method: 'post',
            body: body,
            headers: headers,
            json: true
        }, function (error, response) {
            // Debug('getAnnouncement: '+JSON.stringify(response))
            if (error) return sendErr('编辑容器失败：' + JSON.stringify(error))
            if (+response.statusCode != 200) return sendErr('编辑容器失败A：' + response.body.msg)
            if (+response.body.code != 0) return sendErr('编辑容器失败B：' + response.body.msg)

            Debug('编辑容器成功：' + response.body.msg)
            return response.body
        })
    }

    /** 由 RabbitPro后台-容器管理-一键更新
     * @description 
     * @param {number} id RabbitPro 容器id
     * @returns {any}
     */
    this.container_update_all = function (id) {
        Debug("=====================================")
        Debug("RabbitPro后台-容器管理-一键更新")
        Debug("container_update_all: " + id)
        // Debug('env_update_batch: '+JSON.stringify(ids))
        // if (ids == '') { Debug(`容器${container_id} ID列表为空，跳过`); return true }
        return request({
            url: host + '/container/update_all',
            method: 'post',
            headers: headers,
            body: {
                id: id
            },
            json: true
        }, function (error, response) {
            // Debug(JSON.stringify(response))
            if (error) return sendErr('转换失败：' + JSON.stringify(error))
            if (+response.statusCode != 200) return sendErr('转换失败A：' + response.body.msg)
            if (+response.body.code != 0) return sendErr('转换失败B：' + response.body.msg)

            Debug(`容器 ${id}: ${response.body.msg}`)
            sleep(20000)
            container_check_all(id)
            sleep(20000)
            container_sync_all(id)
            return true
        })
    }

    /** 由 RabbitPro后台-公告编辑 获取公告内容
     * @description 
     * @param 
     * @returns {any}
     */
    this.getAnnouncement = function () {
        return request({
            url: host + '/admin/get_notice_html',
            method: 'get',
            headers: headers,
            json: true
        }, function (error, response) {
            // Debug('getAnnouncement: '+JSON.stringify(response))
            if (error) return sendErr('获取公告失败：' + JSON.stringify(error))
            if (+response.statusCode != 200) return sendErr('获取公告失败A：' + response.body.msg)
            if (+response.body.code != 0) return sendErr('获取公告失败B：' + response.body.msg)

            Debug('获取公告成功：' + response.body.data)
            return response.body.data
        })
    }

    /** 由 RabbitPro后台-公告编辑 获取过期通知
     */
    this.get_expired_html = function () {
        return request({
            url: host + '/admin/get_expired_html',
            method: 'get',
            headers: headers,
            json: true
        }, function (error, response) {
            // Debug('get_expired_html: '+JSON.stringify(response))
            if (error) return sendErr('获取过期通知失败：' + JSON.stringify(error))
            if (+response.statusCode != 200) return sendErr('获取过期通知失败A：' + response.body.msg)
            if (+response.body.code != 0) return sendErr('获取过期通知失败B：' + response.body.msg)

            Debug('获取过期通知成功')
            const content = response.body.data.replace('({{ remarks }})', '').match(/(?<=\>)[^\<]+(?=\<\/)/g)
            return content.join('\n')
        })
    }

    /** 由 setCkById 修改指定pin的key值
     * @description 
     * @param container_id
     * @param pin
     * @param key
     * @param value
     * @returns {any}
     */
    this.setCkByPin = function (container_id, pin, key, value) {
        const users = this.getCksByContainer(container_id)
        if (!Array.isArray(users)) return sendErr('获取ID列表失败A')
        if (users.length == 0) {
            notifyMasters(`users：${JSON.stringify(users)}`)
            notifyMasters(`pin：${pin}`)
            notifyMasters(`key：${key}`)
            notifyMasters(`value：${value}`)
            return sendErr('获取ID列表失败B')
        }

        const user_data = users.filter(item => { return item.pin == decodeURI(pin) })
        if (!Array.isArray(user_data)) return sendErr('获取ID失败A')
        if (user_data.length == 0) {
            push(
                {
                    imType: 'wx',
                    userID: 'Liksbe',
                    content: `获取ID失败B：\n用户：[${imType}]${userId}\n原始pin：${pin}\ndecodeURI(pin)：${decodeURI(pin)}\nID列表：${JSON.stringify(users)}`,
                }
            )
            return sendErr('获取ID失败B')
        }

        user_data[0][key] = value
        return this.setCkById(user_data[0])
    }

    /** 由 RabbitPro后台-环境变量 获取指定容器内所有ck
     * @description 
     * @param container_id RabbitPro 容器id
     * @returns {any}
     */
    this.getCksByContainer = function (container_id) {
        // Debug('getCksByContainer: '+JSON.stringify(body))
        return request({
            url: host + '/env/list',
            method: 'post',
            headers: headers,
            body: {
                container_id: container_id,
                pageNo: 1,
                pageSize: 9999,
            },
            json: true
        }, function (error, response) {
            if (error) return sendErr('读取CK失败:' + JSON.stringify(error))
            if (+response.statusCode != 200) {
                if (+response.body.status != 200) {
                    return sendErr('读取CK:' + response.body.msg)
                } else {
                    return sendErr('读取CK失败')
                }
            }
            return response.body.data
        })
    }

    /** 由 RabbitPro后台-环境变量 更新指定容器内所有指定ck
     * @description 
     * @param {number} container_id RabbitPro 容器id
     * @param {string} ids RabbitPro 容器内账号ID
     * @returns {any}
     */
    this.env_update_batch = function (container_id, ids) {
        // Debug('env_update_batch: '+JSON.stringify(ids))
        if (ids == '') { Debug(`容器${container_id} ID列表为空，跳过`); return true }
        return request({
            url: host + '/env/update_batch',
            method: 'post',
            headers: headers,
            body: {
                container_id: container_id,
                ids: ids
            },
            json: true
        }, function (error, response) {
            // Debug(JSON.stringify(response))
            if (error) return sendErr('转换失败：' + JSON.stringify(error))
            if (+response.statusCode != 200) return sendErr('转换失败A：' + response.body.msg)
            if (+response.body.code != 0) return sendErr('转换失败B：' + response.body.msg)

            Debug(`容器${container_id} 转换CK成功`)
            sleep(10000)
            container_check_all(container_id)
            sleep(10000)
            container_sync_all(container_id)
            return true
        })
    }

    /** 由 RabbitPro后台 重启
     * @description 
     * @returns {any}
     */
    this.admin_restart = function () {
        // Debug('env_update_batch: '+JSON.stringify(ids))
        return request({
            url: host + '/admin/restart',
            method: 'post',
            headers: headers,
            body: null,
            json: true
        }, function (error, response) {
            // Debug(JSON.stringify(response))
            if (error) return sendErr('重启失败：' + JSON.stringify(error))
            if (+response.statusCode != 200) return sendErr('重启失败A：' + response.body.msg)
            if (+response.body.code != 0) return sendErr('重启失败B：' + response.body.msg)

            Debug(`RabbitPro重启提交成功：${response.body.msg}`)
            return true
        })
    }

    /** 由 RabbitPro后台 更新
     * @description 
     * @returns {any}
     */
    this.admin_update = function () {
        // Debug('env_update_batch: '+JSON.stringify(ids))
        return request({
            url: host + '/admin/update',
            method: 'post',
            headers: headers,
            body: null,
            json: true
        }, function (error, response) {
            // Debug(JSON.stringify(response))
            if (error) return sendErr('更新失败：' + JSON.stringify(error))
            if (+response.statusCode != 200) return sendErr('更新失败A：' + response.body.msg)
            if (+response.body.code != 1) return sendErr('更新失败B：' + response.body.msg)

            Debug(`RabbitPro更新提交成功：${response.body.msg}`)
            return true
        })
    }

    /** 由 RabbitPro后台-环境变量-编辑 修改指定id
     * @description 
     * @param body 必须包含 container_id
     * @returns {any}
     */
    this.setCkById = function (body = { id, ...{} }) {
        // Debug('setCkById: '+JSON.stringify(body))
        return request({
            url: host + '/env/edit',
            method: 'post',
            headers: headers,
            body: body,
            json: true
        }, function (error, response) {
            if (error) return sendErr('设置失败：' + JSON.stringify(error))
            if (+response.statusCode != 200) return sendErr('设置失败A：' + response.body.msg)
            if (+response.body.code != 0) return sendErr('设置失败B：' + response.body.msg)

            Debug(`RabbitPro 容器更新CK成功：${body.pin}\n备注：${body.remarks}\nUUID：${body.uuid}`)
            return true
        })
    }

    /** log服务器测试
     * @returns {}
     */
    this.admin_TestServerHost = function (ServerHost) {
        // Debug(`ServerHost：${ServerHost}`)
        return request({
            url: host + '/admin/TestServerHost',
            method: 'post',
            headers: headers,
            body: {
                ServerHost: 'http://' + ServerHost
            },
            json: true
        }, function (error, response) {
            // Debug(JSON.stringify(response))
            if (error) return sendErr('log服务器失败：' + JSON.stringify(error))
            if (+response.statusCode != 200) return sendErr('log服务器失败A：' + response.body.msg)
            if (response.body.msg) return sendErr('log服务器失败B：' + response.body.msg)

            return response.body.success
        })
    }

    /** autMan 内置CK绑定
     * @param pin JD_PIN
     * @returns boolean
     */
    this.linkPin = function (pin) {
        const pinType = 'pin' + imType.toUpperCase()
        bucketSet(pinType, pin, userId)
        // Debug(`${pinType},${pin},${userid}`)
        return true
    }

    /** 由 RabbitPro后台-容器管理 检测ck
     * @description 
     * @param {number} id 容器id
     * @returns {any}
     */
    function container_check_all(id) {
        // Debug(id)
        return request({
            url: host + '/container/check_all',
            method: 'post',
            headers: headers,
            body: {
                id: id
            },
            json: true
        }, function (error, response) {
            // Debug(JSON.stringify(response))
            if (error) return Debug(JSON.stringify(error))
            if (response.statusCode != 200) return Debug('检测ck失败A：' + JSON.stringify(response))
            if (response.body.code != 0) return Debug('检测ck失败B：' + response.body.msg)

            Debug(`容器${id} 检测CK：${response.body.msg}`)
            return response.body
        })
    }

    /** 由 RabbitPro后台-环境变量 批量删除CK
     * @description 
     * @param {number} container_id 容器id
     * @param {string} ids CK id
     * @returns {any}
     */
    this.env_delete = function (container_id, ids) {
        return request({
            url: host + '/env/delete',
            method: 'post',
            headers: headers,
            body: {
                container_id: container_id,
                ids: ids
            },
            json: true
        }, function (error, response) {
            // Debug(JSON.stringify(response))
            if (error) return Debug(JSON.stringify(error))
            if (response.statusCode != 200) return Debug('批量删除CK失败A：' + JSON.stringify(response))
            if (response.body.code != 0) return Debug('批量删除CK失败B：' + response.body.msg)

            Debug(`容器${container_id} 批量删除CK：${response.body.msg}`)
            return true
        })
    }

    /** 由 RabbitPro后台-容器管理 同步ck
     * @description 
     * @param {number} id 容器id
     * @returns {any}
     */
    function container_sync_all(id) {
        return request({
            url: host + '/container/sync_all',
            method: 'post',
            headers: headers,
            body: {
                id: id
            },
            json: true
        }, function (error, response) {
            // Debug(JSON.stringify(response))
            if (error) return Debug(JSON.stringify(error))
            if (response.statusCode != 200) return Debug('同步ck失败A：' + JSON.stringify(response))
            if (response.body.code != 0) return Debug('同步ck失败B：' + response.body.msg)

            Debug(`容器${id} 同步CK：${response.body.msg}`)
            return true
        })
    }

    /** 由 RabbitPro后台-容器管理 获取所有容器配置
     * @description 
     * @param 
     * @returns {any}
     */
    function container_get() {
        return request({
            url: host + '/container/get',
            method: 'post',
            headers: headers,
            json: true
        }, function (error, response) {
            // Debug(JSON.stringify(response))
            if (error) return Debug(JSON.stringify(error))
            // if(response.statusCode != 200) return Debug('获取服务器列表失败A：'+JSON.stringify(response))
            // if(response.body.code != undefined) return Debug('获取服务器列表失败B：'+response.body.msg)

            // Debug('获取RabbitPro容器列表成功: '+response.body.length)
            return response.body
        })
    }

    /** 由 RabbitPro后台-配置文件 获取系统配置
     * @description 
     * @param 
     * @returns {any}
     */
    function admin_GetConfig() {
        return request({
            url: host + '/admin/GetConfig',
            method: 'get',
            headers: headers,
            json: true
        }, function (error, response) {
            // Debug(JSON.stringify(response))
            if (error) return Debug(JSON.stringify(error))
            // if(response.statusCode != 200) return Debug('获取服务器列表失败A：'+JSON.stringify(response))
            // if(response.body.code != undefined) return Debug('获取服务器列表失败B：'+response.body.msg)

            // Debug('获取RabbitPro容器列表成功: '+response.body.length)
            return response.body
        })
    }

    /** 由 RabbitPro后台-配置文件 提交系统配置
     * @description 
     * @param {json} body
     * @returns {any}
     */
    this.admin_SaveConfig = function (body) {
        return request({
            url: host + '/admin/SaveConfig',
            method: 'post',
            body: body,
            headers: headers,
            json: true
        }, function (error, response) {
            // Debug('提交系统配置：'+JSON.stringify(response))
            if (error) return Debug(JSON.stringify(error))
            if (response.statusCode != 200) return Debug('提交配置失败A：' + JSON.stringify(response))
            if (response.body.code != 0) return Debug('提交配置失败B：' + response.body.msg)

            Debug('提交配置成功: ' + response.body.msg)
            return response.body
        })
    }

    /** 登录后台，内置bucketget获取管理员账号
     * @returns {body}
     */
    function admin_auth() {
        const username = bucketGet('RabbitPro', 'username');
        const password = bucketGet('RabbitPro', 'password');
        if (username == '' || password == '') return sendErr('请设置管理员账号')

        return request({
            url: host + '/admin/auth',
            method: 'post',
            body: {
                username: username,
                password: password
            },
            json: true
        }, function (error, response) {
            // Debug(JSON.stringify(response))
            if (error) return sendErr('后台登录失败：' + JSON.stringify(error))
            if (+response.statusCode != 200) return sendErr('后台登录失败A：' + response.body.msg)
            if (response.body.msg) return sendErr('后台登录失败B：' + response.body.msg)

            bucketSet('RabbitPro', 'access_token', response.body.access_token)
            bucketSet('RabbitPro', 'refresh_token', response.body.refresh_token)
            Debug(`后台登录成功`)
            bucketDel('RabbitPro', 'Authorization')//清理旧板数据
            return response.body
        })
    }

    /** 获取RabbitPro版本
     * @description 
     * @param 
     * @returns
     */
    function admin_ver() {
        return request({
            url: host + '/admin/ver',
            method: 'get',
            // headers:headers,
            json: true
        }, function (error, response) {
            // Debug(JSON.stringify(response))
            if (error) return sendErr('获取当前版本失败：' + JSON.stringify(error))
            if (+response.statusCode != 200) return sendErr('获取当前版本失败A：' + response.body.msg)
            if (response.body.msg) return sendErr('获取当前版本失败B：' + response.body.msg)

            return response.body
        })
    }

    /** 后台检查更新
     * @returns {}
     */
    function admin_checkVer() {
        return request({
            url: host + '/admin/checkVer',
            method: 'post',
            // headers:headers,
            json: true
        }, function (error, response) {
            // Debug(JSON.stringify(response))
            if (error) return sendErr('检查更新失败：' + JSON.stringify(error))
            if (+response.statusCode != 200) return sendErr('检查更新失败A：' + response.body.msg)
            if (response.body.msg) return sendErr('检查更新失败B：' + response.body.msg)

            return response.body
        })
    }

    // 参数说明
    this.config_tips = new Object({ // null
        "username": { type: 'string', name: '管理员账号', tip: '' },
        "password": { type: 'string', name: '管理员密码', tip: '', hide: true },
        "RabbitToken": { type: 'string', name: 'RabbitToken', tip: '', hide: true },
        "ServerHost": { type: 'string', name: 'ServerHost', tip: '' },
        // "MaxTab": {type:'number',name:'同时登录人数',tip:''},
        "CloseTime": { type: 'number', name: '超时回收时间', tip: '' },
        "TJ_username": { type: 'string', name: '图鉴账号', tip: '' },
        "TJ_password": { type: 'string', name: '图鉴密码', tip: '', hide: true },
        "Title": { type: 'string', name: '标题', tip: '' },
        "GitProxy": { type: 'string', name: '拉库更新代理', tip: '' },
        "LoginProxy": { type: 'string', name: '登录代理', tip: '' },
        // "WskeyCronStatus": {type:'boolean',name:'转换Cron状态',tip:''},
        "WskeyCron": { type: 'string', name: '转换Cron', tip: '' },
        "mode": { type: 'number', name: '同步模式', tip: '\n⒈车头模式\n⒉传统模式\n⒊分配模式\n⒋随机容器', ary: ['车头模式', '传统模式', '分配模式', '随机容器'] },
        "SyncCkCronStatus": { type: 'boolean', name: '同步CK状态', tip: '' },
        "SyncCkCron": { type: 'string', name: '同步CK', tip: '' },
        // "CheckCkCronStatus": {type:'boolean',name:'检测CK状态',tip:''},
        "CheckCkCron": { type: 'string', name: '检测ck', tip: '' },
        "BeanCronStatus": { type: 'boolean', name: '资产通知开启状态', tip: '' },
        "BeanCron": { type: 'string', name: '资产通知定时', tip: '' },
        // "REAL_CK": {type:'boolean',name:'复制ck',tip:''},
        "AutoCaptchaCount": { type: 'number', name: '滑动验证次数', tip: '' },
        "WXPUSHER_APP_TOKEN": { type: 'string', name: 'WXPUSHER_APP_TOKEN', tip: '', hide: true },
        "WXPUSHER_UID": { type: 'string', name: 'WXPUSHER_UID', tip: '', hide: true },
        "BotApiToken": { type: 'string', name: '机器人对接Token', tip: '', hide: true }
    })

    return this
}

function img_url2aut(url) {
    // if (!['qb', 'tb', 'tg', 'dd'].includes(imType)) { Debug(`使用原始图片：${url}`); return url }
    Debug(`上传图片到aut：${url}`)
    const img = imageDownload(url, './qrcode.png')

    if (img.success == false) { Debug(`图片读取失败`); return false }
    const ib = encodeURIComponent(img.base64);

    const username = bucketGet("cloud", "username")
    const password = bucketGet("cloud", "password")

    return request({
        url: "http://aut.zhelee.cn/imgUpload",
        method: "post",
        dataType: "json",
        formData: {
            username: username,
            password: password,
            imgBase64: ib
        }
    }, function (error, response) {
        if (error != null) { Debug(`图片上传失败A：${url}\n${JSON.stringify(error)}`); return false }
        if (response.statusCode != 200) { Debug(`图片上传失败B${response.statusCode}：${url}\n${JSON.stringify(response)}`); return false }
        if (response.body?.code != 200) { Debug(`图片上传失败C${response.body?.code}：${url}\n${JSON.stringify(response)}`); return false }

        Debug(`图片上传成功：${response.body.result.path}`)
        return response.body.result.path
    })
}

/** 发送错误提示
 * @description 
 * @param tap 提示内容
 * @returns false
 */
function sendErr(tap) {
    let s = sendText(tap)
    sleep(errTime * 1000)
    RecallMessage(s)
    return false
}

/** 发送提示
 * @description 
 * @param tap 提示内容
 * @returns true
 */
function sendRecall(tap) {
    let s = sendText(tap)
    sleep(recallTime * 1000)
    RecallMessage(s)
    return true
}

/** 用户输入
 * @description 
 * @param tap 提示内容
 * @returns {any}
 */
function ShuRu(tap) {
    let t1 = sendText(tap)
    let s = input(inputTime * 1000, 3000)
    if (s == null || s == '') {
        RecallMessage(t1);
        sendErr(`超时，${inputTime}秒内未回复`)
        return false
    } else if (s == "q" || s == "Q") {
        RecallMessage(t1);
        Debug('用户退出')
        sendErr("已退出会话");
        return false
    } else {
        RecallMessage(t1);
        return s;
    }
}

function tool_QR(text) {
    const url = `https://xiaoapi.cn/API/zs_ewm.php?msg=${text}`
    Debug("url：" + JSON.stringify(url))
    return request({
        url: url,
        method: "get",
        dataType: "json"
    }, function (error, response, header, body) {
        Debug("error：" + JSON.stringify(error))
        Debug("body：" + JSON.stringify(body))
        Debug("response：" + JSON.stringify(response))
    })
}

function context_set(title, key) {
    let msg = `修改${title}\n=====================`
    msg += `\n当前：${bucketGet('RabbitPro', key)}`
    msg += `\n~~~~~~~~~~~~~~~~~~~~~\n请输入你要自定义的${title}：\n》0 默认    》q 退出`
    const sure_success = ShuRu(msg)

    if (/^[oO0]$/.test(sure_success)) { // 恢复默认
        bucketDel('RabbitPro', key)
        return sendRecall(`已恢复默认${title}`)
    } else if (sure_success === false) { // 用户退出
        return false
    } else { // 自定义
        bucketSet('RabbitPro', key, sure_success)
        return sendRecall(`已更新自定义${title}`)
    }
}

main()

Debug('================ End ================')
