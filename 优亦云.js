//[author: jusbe]
//[title: 优亦云]
//[language: nodejs]
//[class: 工具类]
//[service: Jusbe] 售后联系方式
//[disable: false] 禁用开关，true表示禁用，false表示可用
//[admin: true] 是否为管理员指令
//[rule: raw ^优亦云白名单$] 匹配规则，多个规则时向下依次写多个
//[priority: 1] 优先级，数字越大表示优先级越高
//[platform: all] 适用的平台
//[open_source: false]是否开源
//[icon: 图标url]图标链接地址，请使用48像素的正方形图标，支持http和https
//[version: 1.0.0]版本号
//[public: true] 是否发布？值为true或false，不设置则上传aut云时会自动设置为true，false时上传后不显示在市场中，但是搜索能搜索到，方便开发者测试
//[price: 2] 上架价格
//[description: 优亦云白名单，自行设置 插件定时 或 定时推送<br>送头链接: <a href="http://yyyip.cn/?r=3155" title="送头链接1">优亦云</a><br>首发: 240414<br><img src="https://bbs.autman.cn/assets/files/2024-07-01/1719835004-308388-292309cf-a601-4fe1-b51b-8b006e9e816d.jpg" alt="优亦云" />] 使用方法尽量写具体
// [param: {"required":true,"key":"yyyip.token","bool":false,"placeholder":"","name":"token","desc":""}]

const middleware = require('./middleware.js');
const axios = require('axios');

const senderID = middleware.getSenderID();
const s = new middleware.Sender(senderID)

!(async () => {
    const plugin_name = await s.getPluginName()
    const plugin_version = await s.getPluginVersion()

    const token = await middleware.bucketGet("yyyip", "token")

    let msg = `${plugin_name} v${plugin_version.split(" ")[0]}\n========================`

    // 【获取用户套餐ID，名称】
    let upacks = await axios.get(`http://data.yyyip.cn:8888/whiteip_api?method=upack&token=${token}`)
        .then(response => {
            response = response.data.data.filter(v => v.upackid)
            console.log("【获取用户套餐ID，名称】", response)
            msg += `\n✅套餐数量: ${response.length}`
            return response
        })
    if (upacks.code) return await s.reply(msg + "\n❌" + upacks.msg)
    await sleep(1)

    // 【获取IP】
    const ip_now = await get_ip()
    console.log("【获取IP】", JSON.stringify(ip_now))
    if (!ip_now) return await s.reply("获取IP失败:" + ip_now)
    msg += `\n✅当前IP: ${ip_now}`
    await sleep(1)

    // 【白名单列表】 【检验白名单】
    const whiteList_verify = await axios.get(`http://data.yyyip.cn:8888/whiteip_api?method=list&token=${token}`).then(r => { return r.data })
    console.log("【白名单列表】", JSON.stringify(whiteList_verify.data))
    if (whiteList_verify.code) return await s.reply("获取白名单失败:" + whiteList_verify.statusText)
    let whiteList = new Array()
    whiteList_verify.data
        .filter(v => v.upackid)
        .forEach(element => element.ip ? whiteList.push(element.ip) : false)
    if (whiteList.includes(ip_now)) return await s.reply(msg + "\n✅白名单已存在")
    msg += "\n✅白名单不存在，尝试更新"
    await sleep(1)

    // 【删除白名单】
    for (let w of whiteList_verify.data) {
        if (w.ip)
            await axios.get(`http://data.yyyip.cn:8888/whiteip_api?method=del&token=${token}&ip=${w.ip}`)
                .then(response => {
                    console.log("【删除白名单】", response.data)
                    msg += `\n✅${response.data.msg}`
                })
                .catch(error => console.error(error))
        await sleep(1)

    }

    // 【添加白名单】
    for (let v of upacks.data) {
        // await upacks.data.forEach(async v => {
        await axios.get(`http://data.yyyip.cn:8888/whiteip_api?method=add&token=${token}&upackid=${v.upackid}&ip=${ip_now}`)
            .then(response => {
                console.log("【获取用户套餐ID，名称】", response.data)
                msg += `\n✅${response.data.msg}`
            })
        await sleep(1)
    }

    return await s.reply(msg)
})()

/** sleep
 * @description 示例：await sleep(60)
 * @param {number} s 秒
 * @returns {*}
 */
function sleep(s) {
    return new Promise(resolve => setTimeout(() => resolve(), s * 1000));
};

async function get_ip() { // http://test.ipw.cn
    return await axios.get(`https://4.ipw.cn`).then(r => { return r.data }).catch(e => console.log(e)) // ipw
        || await axios.get(`http://121.199.42.16/VAD/OnlyIp.aspx?yyy=123`).then(r => { return r.data }) // 携趣1
        || await axios.get(`http://api.xiequ.cn/VAD/OnlyIp.aspx?yyy=123`).then(r => { return r.data }) // 携趣2
        || await axios.get(`http://www.xiequ.cn/OnlyIp.aspx?yyy=123`).then(r => { return r.data }) // 携趣3
}
