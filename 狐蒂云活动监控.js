//[title: 狐蒂云活动监控]
//[language: nodejs]
//[class: 查询类]
//[author: jusbe] 售后联系方式
//[service: jusbe] 售后联系方式
//[disable: true] 禁用开关，true表示禁用，false表示可用
//[admin: false] 是否为管理员指令
//[rule: raw ^狐蒂云$] 匹配规则，多个规则时向下依次写多个
//[priority: 0] 优先级，数字越大表示优先级越高
//[platform: qq,qb,wx,tb,tg,web,wxmp] 适用的平台
//[open_source: false]是否开源
//[icon: 图标url]图标链接地址，请使用48像素的正方形图标，支持http和https
//[version: 1.0.0]版本号
//[public: false] 是否发布？值为true或false，不设置则上传aut云时会自动设置为true，false时上传后不显示在市场中，但是搜索能搜索到，方便开发者测试
//[price: 2] 上架价格
//[description: 命令》狐蒂云（可自定义）<br>说明》活动监控<br>依赖》axios, cheerio<br><br>首发》241101<br><img src="https://bbs.autman.cn/assets/files/2024-11-02/1730535259-881719-f8ffce2e-afe3-437f-a83f-3413d27104be.jpg" alt="狐蒂云" />] 使用方法尽量写具体

const axios = require('axios');
const cheerio = require('cheerio');

const middleware = require('./middleware.js');
const senderID = middleware.getSenderID();
const s = new middleware.Sender(senderID)

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
        // const im = await s.getImtype()
        // const user_id = await s.getUserID()
        // const user_name = await s.getUserName()
        // const group_name = await s.getGroupName()
        // const group_id = await s.getChatID()
        // const param1 = await s.param(1)
        // const param2 = await s.param(2)
        // const param3 = await s.param(3)
        // const message = await s.getMessage()
        // const message_id = await s.getMessageID()

       // const { inputReg, rebug, sleep, getQLS, QingLong, sendNotify } = jusapi
       // const moment = require('moment')

    const response = await axios.get('https://www.szhdy.com/newestactivity.html');
    const $ = cheerio.load(response.data);

    const activityItems = $('a[data-status="ongoing"]');
    // console.log(activityItems)

    const activies = [],
        host = "https://www.szhdy.com", // 拼接主页
        act_blacks = ["精选优惠 用云无忧", "终身使用权云服务器专区"], // 活动黑名单
        price = 999 // 主机筛选价格

    // 筛选活动
    activityItems.each((index, element) => {
        const activity_item_content = $(element).find('.activity-item-content')
        const item = {
            'href': host + $(element).attr('href'),
            'title': activity_item_content.find('.activity-item-text').find('.activity-item-title').children().first().text(),
            'desc': activity_item_content.find('.activity-item-text').find('.activity-item-desc').children().first().text(),
            'time': activity_item_content.find('.activity-item-information').find('.activity-item-time').children().first().text().replace(/\s+/g, " "),
            'childs': []
        }
        act_blacks.every(e => !item['title'].includes(e)) && activies.push(item)
    });

    // 活动遍历
    for (let item of activies) {
        const response = await axios.get(item['href']);
        const $ = cheerio.load(response.data);

        // 主机遍历
        $('.activity-row').children().each((i, v) => {
            const head = $(v).children().first(),
                main = $(v).children().eq(1),
                form = main.children().first().children().first().text()
            item.childs.push({
                'id': $(v).attr('data-id'),
                'title': head.children().first().children().first().children().first().text(),
                'desc': head.children().first().children().first().children().eq(1).text(),
                'price': +head.children().eq(1).children().first().children().eq(1).children().first().text() ||
                    + main.children().first().children().eq(1).children().first().children().first().text(),
                'form': form.includes("核心") ?
                    form.replace(/(\S+：)[\s\n\r]+/g, "<br>$1").replace(/[\r\n\s]+/g, "").replace(/\<br\>/ig, "\n") :
                    head.children().eq(1).children().first().text().replace(/(\S+：)[\s\n\r]+/g, "<br>$1").replace(/[\r\n\s]+/g, "").replace(/\<br\>/ig, "\n"),
                'status': (main.children().eq(1).children().eq(1).text() ||
                    main.children().eq(1).text())
                    .replace(/[\r\n\s]+/, "")
            })
        })
    }

    // console.dir(activies[0].childs)
   // console.dir(JSON.stringify(activies, null, 4))
      let msg = title
      msg +="\n"+ activies.map(
      activie=>{
        let _msg = `》》》 #${activie?.title} 《《《\n`
        _msg += activie.childs.map((child_item,child_index)=>{
          let child_msg = child_index?"├":"┌"
          child_msg +="┄┄┄┄┄┄┄┄┄┄┄┄┄┄\n┆"
          child_msg+=child_item.status.includes("立即购买")?"✅ ":"❌ "
          child_msg+=child_item.title.replace(/[\S\d]+点补货.*/g,"")
          child_msg+="\n┆定价: "+child_item.price+"\n"
         child_msg+= child_item.form.replace(/\n/g,"\n┆")
          
          return child_msg
        }).join("\n")+("\n└┄┄┄┄┄┄┄┄┄┄┄┄┄┄")
        
        return _msg
      }).join("\n")
        s.reply(msg)
    })()