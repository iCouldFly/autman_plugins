// [title: 农场浇水]
// [class: 工具类]
// [version: 1.0.0]
// [price: 999]
// [rule: ^(新|旧)农场浇水$]
// [bypass: false]
// [priority: 1]
// [public: false]
// [admin: false]
// [disable: true]
// [service: Jusbe]
// [platform: ALL]
// [description: 农场浇水，用于传ck到指定容器运行指定脚本]
//[param: {"required":true,"key":"jd_water.ck_ql_name","bool":false,"placeholder":"","name":"取CK容器","desc":""}]
//[param: {"required":true,"key":"jd_water.cron_ql_name","bool":false,"placeholder":"","name":"跑任务容器","desc":""}]
//[param: {"required":true,"key":"jd_water.old_scr_name","bool":false,"placeholder":"","name":"旧农场脚本","desc":""}]
//[param: {"required":true,"key":"jd_water.new_scr_name","bool":false,"placeholder":"","name":"新农场脚本","desc":""}]
//[param: {"required":true,"key":"jd_water.ck_key_name","bool":false,"placeholder":"","name":"取CK变量","desc":""}]
//[param: {"required":true,"key":"jd_water.old_key_name","bool":false,"placeholder":"","name":"旧农场变量","desc":""}]
//[param: {"required":true,"key":"jd_water.new_key_name","bool":false,"placeholder":"","name":"新农场变量","desc":""}]

const ck_ql_name = bucketGet("jd_water", "ck_ql_name")
const cron_ql_name = bucketGet("jd_water", "cron_ql_name")
const old_scr_name = bucketGet("jd_water", "old_scr_name")
const new_scr_name = bucketGet("jd_water", "new_scr_name")
const ck_key_name = bucketGet("jd_water", "ck_key_name")
const old_key_name = bucketGet("jd_water", "old_key_name")
const new_key_name = bucketGet("jd_water", "new_key_name")

const pluginName = getTitle()
// const isadmin = isAdmin()
const userid = GetUserID()
// const chatid = GetChatID()
const imType = GetImType();
const param1 = param(1);
// const param2 = param(2);
// const param3 = param(3);
// const param4 = param(4);
// const content = GetContent()

Debug(`<div style="text-align: center; font-size: 72px; font-weight: bold;">${pluginName}</div>`)

try {
    importJs('jusapi.js')
} catch (e) {
    throw new Error(`【${pluginName}】请在插件市场安装“jusapi”\n .`);
}
const jv = jusapi.test_version("0.1.3")
if (!jv.success) throw new Error(`【jusapi】插件需更新至：${jv.data}+\n .`)

function main() {
    let pins = bucketKeys(`pin${imType.toUpperCase()}`, userid)
    if (!Array.isArray(pins)) return sendErr("未找到京东账号，请给我发“登录”进行绑定")
    if (!pins.length) return sendErr("未找到京东账号，请给我发“登录”进行绑定.")

    const qls = getQLS()

    const scr_name = param1 == "旧" ? old_scr_name : new_scr_name
    const key_name = param1 == "旧" ? old_key_name : new_key_name
    const cron_qlcfg = qls.filter(v => { return v.name == cron_ql_name }); if (cron_qlcfg.length == 0) return sendErr("青龙连接失败")
    const cron_ql = new QingLong(cron_qlcfg[0].host, cron_qlcfg[0].client_id, cron_qlcfg[0].client_secret)
    const cron_ql_cron = cron_ql.getCrons(scr_name)
    if (!cron_ql_cron[0].status) return sendErr("任务运行中，请稍后再试")

    let select = inputReg("请选择要浇水的账号（0 全部，q 退出）：\n" + pins.map((v, i) => { return `${i + 1}. ${v}` }).join("\n"), /q|\d+/i)
    if (select === false) return false
    if (select > pins.length) return sendErr("输入有误")
    if (+select) pins = pins.filter((v, i) => { return i == select - 1 })

    const ck_qlcfg = qls.filter(v => { return v.name == ck_ql_name }); if (ck_qlcfg.length == 0) return sendErr("青龙连接失败")
    const ck_ql = new QingLong(ck_qlcfg[0].host, ck_qlcfg[0].client_id, ck_qlcfg[0].client_secret)
    const ql_value = ck_ql.getEnvs(ck_key_name)
        .filter(v => {
            let find = false
            pins.forEach(element => {
                if (v.value.includes(element)) find = true
            })
            return find
        })
    // sendText(JSON.stringify(ql_value))

    cron_ql.delEnvByKey(key_name, false)
    const createV = ql_value.filter(v => {
        return cron_ql.createEnv(v).success
    })
    if (createV.length === 0) return sendErr("账号提交失败")

    sendText(cron_ql.runCrons([cron_ql_cron[0].id]).success ? "开始运行任务" : "任务运行失败")
    // { name: '', value: '', remarks: '' }
    // sendText(`ck_id: ${ck_id}`)
    // sendText(`value: ${JSON.stringify(value)}`)
    // sendText(`value 长度: ${value.length}`)
    // if (value.length) {
    //     ql.putEnv({ ...value[0], ...{ name: key_name, value: ck, remarks: `${ck_id}@${imType}@${userid}@变量更新 by Jusbe` } })
    //     sendText(`更新变量：${ck_id}`)
    // } else {
    //     ql.createEnv({ name: key_name, value: ck, remarks: `${ck_id}@${imType}@${userid}@变量更新 by Jusbe` })
    //     sendText(`新建变量：${ck_id}`)
    // }
    // rebug(value)
}

main()
