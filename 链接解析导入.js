//[author: jusbe]
//[title: 链接解析导入]
//[language: nodejs]
//[class: 工具类]
//[service: Jusbe] 售后联系方式
//[disable:false] 禁用开关，true表示禁用，false表示可用
//[admin: true] 是否为管理员指令
//[rule: raw ^链接解析导入$] 匹配规则，多个规则时向下依次写多个
//[priority: 1] 优先级，数字越大表示优先级越高
//[platform: all] 适用的平台
//[open_source: true]是否开源
//[icon: 图标url]图标链接地址，请使用48像素的正方形图标，支持http和https
//[version: 1.0.0 ]版本号
//[public: true] 是否发布？值为true或false，不设置则上传aut云时会自动设置为true，false时上传后不显示在市场中，但是搜索能搜索到，方便开发者测试
//[price: 2] 上架价格
//[description: 说明》将链接解析（JSON格式文件）导入autman，开源，见插件内说明<br>命令: 链接解析导入》可自定义<br><br>首发》241208<br><img src="https://bbs.autman.cn/assets/files/2024-12-08/1733658864-431392-20241208195402.jpg" alt="exvarlink" />] 

const fileName = "9R链接解析.txt" // 文件名，文件放在 /autman/plugin/scripts 下。或自行调整路径
const mode = 0 // 0 覆盖同变量规则, 1 追加规则
const enBackUp = 1 // 是否备份旧规则: 0 关闭, 1 启用
const enOutput = 0 // 是否导出新规则: 0 关闭, 1 启用

const fs = require('fs').promises;

const middleware = require('./middleware.js');
const senderID = middleware.getSenderID();
const s = new middleware.Sender(senderID)

!(async () => {
    const old_varlink = JSON.parse((await s.bucketGet("jd_cookie", "varlink")) || "[]")
    const push_varlink = await fs.readFile(fileName, { encoding: "utf-8" }).then(d => JSON.parse(d)).catch(async e => await s.reply(e.code === 'ENOENT' ? `未找到文件 ${fileName}` : '读取文件失败，详见日志').then(() => process.exit()))
    // const new_varlink = await s.reply("请将JSON格式文件发给我").then(async () => await s.input(60000, 1, false).then(async d => await s.reply(decodeURIComponent(new URL(d.match(/file=(.+?)\]/i)[1]).pathname.split("/").pop())).then(d => d.text())).catch(() => s.reply("退出")))

    let new_varlink = old_varlink
    if (mode) new_varlink = old_varlink.concat(push_varlink);
    else {
        push_varlink.forEach(push_item => {
            let isFind = false
            new_varlink = new_varlink.map(old_item => {
                const find_item = old_item["var_key_maps"].find(old_kv => push_item["var_key_maps"].find(push_kv => push_kv["var"] && push_kv["var"] === old_kv["var"]))
                if (find_item) {
                    isFind = true
                    delete push_item["id"]
                    return { ...old_item, ...push_item }
                } else {
                    return old_item
                }
            })
            if (isFind === false) new_varlink.push(push_item)
        })
    }

    s.bucketSet("jd_cookie", "varlink", JSON.stringify(new_varlink))
    fs.rm(fileName)

    const timestamp = Date.now()
    enBackUp && fs.writeFile(`./varlink_${timestamp}.bak.json`, JSON.stringify(old_varlink, null, 4))
    enOutput && fs.writeFile("./varlink_new.json", JSON.stringify(new_varlink, null, 4))

    s.reply(`模式: ${["覆盖", "追加"][mode]}\n原有规则: ${old_varlink.length}\n追加规则: ${push_varlink.length}\n合并后: ${new_varlink.length}${enBackUp ? "\n备份: varlink_" + timestamp + ".bak.json" : ""}${enOutput ? "\n导出: varlink_new.json" : ""}`)
})()
