//[author: jusbe]
//[title: 插件提取]
//[language: nodejs]
//[class: 工具类]
//[service: Jusbe] 售后联系方式
//[disable: false] 禁用开关，true表示禁用，false表示可用
//[admin: true] 是否为管理员指令
//[rule: ^插件提取$] 匹配规则，多个规则时向下依次写多个
//[priority: 1] 优先级，数字越大表示优先级越高
//[platform: all] 适用的平台
//[open_source: true]是否开源
//[icon: 图标url]图标链接地址，请使用48像素的正方形图标，支持http和https
//[version: 1.3.0 重构部分代码以及开源]版本号
//[public: false] 是否发布？值为true或false，不设置则上传aut云时会自动设置为true，false时上传后不显示在市场中，但是搜索能搜索到，方便开发者测试
//[price: 2] 上架价格
//[description: 用于2.9.4之前提取“我的”中已安装插件到 /autMan/plugin/插件提取_xxx 下，提取插件放在对应的 encrypted_es5 或 encrypted_ext 目录下使用<br>首发: 240502<br><img src="https://bbs.autman.cn/assets/files/2024-06-19/1718796718-74337-3a7cd149-db7e-4c58-9abe-70be9245d54a.jpg" alt="插件提取" />] 使用方法尽量写具体

const fs = require('fs');
const path = require('path');

const middleware = require('./middleware.js');
const senderID = middleware.getSenderID();
const s = new middleware.Sender(senderID)

!(async () => {
    const plugin_name = await s.getPluginName()
    const plugin_version = (await s.getPluginVersion()).match(/^[\d\.]+/)[0]

    //单位转换
    const formatBytes = (bytes) => bytes ? (i = Math.floor(Math.log(bytes) / Math.log(1024)), `${(bytes / Math.pow(1024, i)).toFixed(2)} ${['B', 'KB', 'MB', 'GB', 'TB'][i]}`) : '0 B'

    s.reply("开始执行插件提取")
    let out_log = `${plugin_name} v${plugin_version}\n========================`

    // ============================== ES5 ============================== //
    const es5_plugin_keys = await middleware.bucketAllKeys("plugins");
    console.log("【插件提取】找到", es5_plugin_keys.length, "个 ES5插件")
    s.reply(`找到 ${es5_plugin_keys.length} 个 ES5插件，开始提取插件`)
    out_log += `\nES5插件: ${es5_plugin_keys.length} 个 `

    //创建路径
    if (!fs.existsSync("../插件提取_es5")) {
        fs.mkdirSync("../插件提取_es5");
    }
    console.log("【插件提取】提取路径:", path.resolve('../插件提取_es5'))
    console.log("========================")
    out_log += `\n提取路径: ${path.resolve('../插件提取_es5')} `

    for (let _name of es5_plugin_keys) {
        const _src = await middleware.bucketGet("plugins", _name)
        console.log("【插件提取】提取插件:", _name);
        fs.writeFile(`../插件提取_es5/${_name}.js`, _src, err => {
            if (err) {
                console.error(JSON.stringify(err));
            } else {
                console.log(`==> 写入成功（${formatBytes(_src.length)}）`);
            }
        });

        await new Promise(resolve => setTimeout(() => resolve(), 1 * 1000))
    }

    // ============================== EXT ============================== //
    const ext_plugin_keys = await middleware.bucketAllKeys("plugins_script");
    console.log("【插件提取】找到", ext_plugin_keys.length, "个 EXT插件")
    s.reply(`找到 ${ext_plugin_keys.length} 个 EXT插件，开始提取插件`)
    out_log += `\n========================\nEXT插件: ${ext_plugin_keys.length} 个 `

    //创建路径
    if (!fs.existsSync("../插件提取_ext")) {
        fs.mkdirSync("../插件提取_ext");
    }
    console.log("【插件提取】提取路径:", path.resolve('../插件提取_ext'))
    console.log("========================")
    out_log += `\n提取路径: ${path.resolve('../插件提取_ext')} `

    for (let _name of ext_plugin_keys) {
        const _src = await middleware.bucketGet("plugins_script", _name)
        console.log("【插件提取】提取插件:", _name);
        fs.writeFile(`../插件提取_ext/${_name}`, _src, err => {
            if (err) {
                console.error(JSON.stringify(err));
            } else {
                console.log(`==> 写入成功（${formatBytes(_src.length)}）`);
            }
        });

        await new Promise(resolve => setTimeout(() => resolve(), 1 * 1000))
    }

    // ============================== OUT_LOG ============================== //
    await s.reply(out_log)
})()
