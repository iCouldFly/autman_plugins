//[author: jusbe]
//[title: 农场浇水]
//[language: nodejs]
//[class: 工具类]
//[service: Jusbe] 售后联系方式
//[disable:false] 禁用开关，true表示禁用，false表示可用
//[admin: false] 是否为管理员指令
//[rule: raw ^(新|旧)?农场浇水$] 匹配规则，多个规则时向下依次写多个
//[priority: 1] 优先级，数字越大表示优先级越高
//[platform: all] 适用的平台
//[open_source: true]是否开源
//[icon: 图标url]图标链接地址，请使用48像素的正方形图标，支持http和https
//[version: 1.1.0 增加脚本运行失败检测]版本号
//[public: true] 是否发布？值为true或false，不设置则上传aut云时会自动设置为true，false时上传后不显示在市场中，但是搜索能搜索到，方便开发者测试
//[price: 2] 上架价格
//[description: 说明》对接Faker对应脚本，需要 jusapi 版本 1.3.4 以上<br>命令1》农场浇水<br>命令2》新农场浇水<br>命令3》旧农场浇水<br>权限》qls<br><br>首发: 241007<br><img src="https://bbs.autman.cn/assets/files/2024-10-08/1728367906-297328-1.jpg" alt="农场浇水1" /><img src="https://bbs.autman.cn/assets/files/2024-10-08/1728367906-321806-2.jpg" alt="农场浇水2" /><img src="https://bbs.autman.cn/assets/files/2024-10-08/1728367906-338910-3.jpg" alt="农场浇水3" />] 
// [param: {"required":true,"key":"watering.ql","bool":false,"placeholder":"qinglong1","name":"容器名称","desc":"容器管理-对接容器-名称"}]
// [param: {"required":false,"key":"watering.scr_old","bool":false,"placeholder":"默认: shufflewzc_faker3_main/jd_fruit_watering","name":"任务名称（旧）","desc":""}]
// [param: {"required":false,"key":"watering.scr_new","bool":false,"placeholder":"默认: shufflewzc_faker3_main/jd_XinFarm_water","name":"任务名称（新）","desc":""}]
// [param: {"required":false,"key":"watering.val_old","bool":false,"placeholder":"默认: FRUIT_WATERING_PIN","name":"变量名称（旧）","desc":"指定PIN账号浇水变量名"}]
// [param: {"required":false,"key":"watering.val_new","bool":false,"placeholder":"默认: jd_XinFarm_waterpin","name":"变量名称（新）","desc":"指定PIN账号浇水变量名"}]

const fs = require('fs');

const middleware = require('./middleware.js');
const senderID = middleware.getSenderID();
const s = new middleware.Sender(senderID)

// const jusapiUrl = "https://gitee.com/jusbe/autman_plugins/raw/scripts/jusapi.js"
try { var jusapi = require("./jusapi.js"); } catch (e) { if (e.code === "MODULE_NOT_FOUND") { const jusapiUrl = "https://raw.githubusercontent.com/iCouldFly/autman_plugins/refs/heads/scripts/jusapi.js"; s.reply("未找到 jusapi，尝试自动下载"); fetch(jusapiUrl).then(response => response.text()).then(data => { if (data.includes("title: jusapi")) { fs.writeFile("./jusapi.js", data).then(value => s.reply("jusapi 下载完成，请重新发起命令")).catch(reason => console.error(reason) || s.reply("jusapi 下载失败")).finally(() => process.exit()); } else { console.error(data) || s.reply("jusapi 下载错误").then(() => process.exit()); }; }).catch(e => { console.error(jusapiUrl, "下载失败:", e) || s.reply("jusapi 下载失败 " + (e?.cause?.code ?? "")).then(() => process.exit()); }); } else { console.error(e) || s.reply("jusapi 加载失败").then(() => process.exit()); }; };

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
        const im = await s.getImtype()
        const user_id = await s.getUserID()
        const param1 = await s.param(1)

        const { inputReg, getQLS, QingLong, sleep } = jusapi

        // 新旧农场选择
        let mode = param1 ||
            await inputReg(`${title}\n【1】新农场浇水\n【2】旧农场浇水\n${separator}\n》q 退出`, /^[12]$/)
                .then(async ({ success, data, message }) => success ?
                    ["新", "旧"][data - 1] :
                    await s.reply(message).then(() => process.exit()))

        // 用户账号信息
        let bucket_name = `pin${im.toUpperCase()}`,
            all_keys = await s.bucketKeys(bucket_name, user_id)
        all_keys.length || await s.reply("未找到您的账号，请对我发“登录”进行登记").then(() => process.exit())

        let set_keys = await inputReg(`${mode}农场浇水\n${separator}\n【0】全部\n${all_keys.map((v, i) => "【" + (i + 1) + "】" + v).join("\n")}\n${"~".repeat(separator_width)}\n如果上面没有您要浇水的账号，请对我发“登录”进行登记\n${separator}\n请选择要浇水的账号，指定多号任意符号分隔\n》q 退出`).then(async ({ success, data, message }) => success ? data : await s.reply(message).then(() => process.exit()))
        if (set_keys == "0") { set_keys = all_keys }
        else if (/[\,\/\*\+\.\\\!\@\#\$\%\^\&\~\`]/.test(set_keys)) { let indexs = set_keys.replace(/[\,\/\*\+\.\\\!\@\#\$\%\^\&\~\`]/g, ",").split(","); set_keys = indexs.map(i => all_keys[i - 1]).filter(f => f) }
        else if (/\d+/) { set_keys = [all_keys[set_keys - 1]] }
        all_keys.length || await s.reply("选择错误，请重新发起命令").then(() => process.exit())

        // 确认浇水
        await inputReg(`${mode}农场浇水\n您选择了以下账号:\n${separator}\n${set_keys.map((v, i) => "【" + (i + 1) + "】" + v).join("\n")}\n${separator}\n》y 确认    》q 退出`, /^y$/i).then(async ({ success, data, message }) => success || await s.reply(message).then(() => process.exit()))

        // 青龙连接
        const ql_name = (await middleware.bucketGet("watering", "ql")) || await s.reply("未设置容器名称").then(() => process.exit())
        const ql_cfg = await getQLS(ql_name).then(async ({ data, message, success }) => success ? data : await s.reply(message).then(() => process.exit()))
        const ql = await new QingLong(ql_cfg?.[0]); ql.success || await s.reply(ql.message || `容器连接失败: ${ql_name}`).then(() => process.exit())
        console.log(`容器【${ql_name}】连接成功`)

        // 脚本检查
        const scr_old = await middleware.bucketGet("watering", "scr_old") || "shufflewzc_faker3_main/jd_fruit_watering",
            scr_new = await middleware.bucketGet("watering", "scr_new") || "shufflewzc_faker3_main/jd_XinFarm_water",
            scr_name = { "新": scr_new, "旧": scr_old }[mode],
            scr = await ql.getCrons(scr_name).then(async ({ success, message, data }) => success ? data?.data?.[0] : await s.reply(message).then(() => process.exit()))
        console.log(`当前使用脚本: ${scr_name}`)

        scr || await s.reply("搜索任务失败").then(() => process.exit())
        scr.status || await s.reply("任务运行中，请过段时间再试").then(() => process.exit())
        scr.isDisabled || ql.disCrons(scr.id).then(() => console.error("检测到任务未禁用，已尝试禁用"))

        // 变量检查
        let val_old = await middleware.bucketGet("watering", "val_old") || "FRUIT_WATERING_PIN",
            val_new = await middleware.bucketGet("watering", "val_new") || "jd_XinFarm_waterpin",
            val_name = { "新": val_new, "旧": val_old }[mode],
            val = await ql.getEnvs(val_name).then(async ({ success, message, data }) => success ? data : await s.reply(message).then(() => process.exit()))
        val?.length && await ql.delEnvs(val.map(v => v.id)).then(({ code, message }) => console.log(`清空变量[${code}]: ${message}`))
        console.log(`当前指定PIN变量: ${val_name}`)

        // 创建变量
        await ql.createEnvs(val_name, set_keys.join({ "新": "@", "旧": "&" }[mode]), "by jusbe")
            .then(async ({ success, message, data }) => success ? val = data : await s.reply(message).then(() => process.exit()))
            .catch(async e => console.error(e) || await s.reply("创建变量失败，详见日志").then(() => process.exit()))

        // 执行任务 && ql.delEnvs(val.map(v => v.id))
        await ql.runCrons(scr.id)
            .then(async ({ success, message }) => success ? s.reply("开始执行任务") : await s.reply(message).then(() => process.exit()))
            .catch(async e => console.error(e) || await s.reply("执行任务失败，详见日志").then(() => process.exit()))

        let tryTime = 5;
        while (tryTime--) {
            await sleep(5)
            await ql.getLog(scr.id)
                .then(async ({ data }) => /执行结束.+耗时[\s\d]+秒/.test(data) && await s.reply(data.match(/"message":"(.+?)"/)?.[1] || "浇水任务异常，请检查ql日志").then(() => process.exit()))
                .catch(async e => console.error(e) || await s.reply("检查进度错误").then(() => process.exit()))
        }
    })()