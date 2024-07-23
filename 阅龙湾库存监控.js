// [title: 阅龙湾库存监控]
// [class: 查询类]
// [rule: ^阅龙湾库存$]
// [cron: 5 0 * * *]
// [bypass: false]
// [priority: 1]
// [admin: true]
// [disable: false]


async function main(){
    const middleware = await require('./middleware.js');
    const axios = await require('axios');

    const senderID = await middleware.getSenderID();
    const s = await new middleware.Sender(senderID)
    const pluginName = `【${await s.getPluginName()}】`

    // 自定义标头
    const headers = {
        'Cookie': ''
    };

    // 发送GET请求并包括自定义标头
    axios.get('http://92570.activity-42.m.duiba.com.cn/chome/index', { headers })
    .then((response) => {
        const html = response.data;

        // 使用正则表达式提取JavaScript中的unitList数据
        const regex = /\"groupId\"\:(\d+)/g;
        const match = html.match(regex);
        const groupIds = match.map((item)=>{
            return item.split(':')[1]
        })

        if (groupIds && groupIds[1]) {
            console.debug(pluginName+'商品分类列表：'+groupIds);
            for(let i = 0; i<groupIds.length; i++){
                const gn_reg = /(?<=\"groupName\"\:\")([^\"]+)/g;
                const groupName = html.match(gn_reg)[i];

                const host = 'http://92570.activity-42.m.duiba.com.cn/chw/visual-editor/items/list?classifyId='+groupIds[i]
                axios.get(host, { headers })
                .then(async (response) => {
                    const data = response.data;
                    if(data.success == true){
                        const list = data.data.list
                        let str = `${pluginName}${groupName}\n----------------------\n`
                        let _ary = []
                        for(let a = 0; a<list.length; a++){
                            //商品详情页检测
                            const host = 'https://92570.activity-42.m.duiba.com.cn/mobile/detail?appItemId='+list[a]['id']
                            await axios.get(host, { headers })
                            .then((response) => {
                                const html = response.data;

                                const lock_reg = /(?<=\"lock\"\:)(\w+)/s;
                                const lock = html.match(lock_reg)[0];
                                // console.debug(pluginName+'lock：'+lock);
                                if(lock == false || lock == 'false'){
                                    const reg1 = /(?<=\"remaining\"\:)(\d+)/s;
                                    const currentStock = html.match(reg1)[0];

                                    const reg2 = /(?<=\"totalStock\"\:)(\d+)/s;
                                    const currentTotalStock = html.match(reg2)[0];

                                    const _s = ` ${list[a]['credits']}🎁${list[a]['title']}`
                                    _ary.push(_s)
                                    console.debug(`${pluginName}${list[a]['title']}，库存：${currentStock}/${currentTotalStock}`);
                                }
                            })
                            await sleep(1000)
                        }
                        console.debug(pluginName+_ary.toString())
                        if(_ary.length){
                            str += _ary.join('\n')
                        }else{
                            str += '价值商品无库存'
                        }
                        str+='\n'
                        s.reply(str.replace(/\n/g,'\\n'))
                        await middleware.push('wx', 48236768377, 0, '', str) //日志
                        await middleware.push('qq', 484584515, 0, '', str) //啊哈
                        await middleware.push('qb', 549998515, 0, '阅龙湾库存', str) //频道
                        // await middleware.push('qq', 315519023, 0, '', str) //测试
                        // // console.debug(pluginName+str)
                    }else{
                        console.error(pluginName+'商品列表返回失败');
                        push_str += '商品列表返回失败'
                    }
                })
                .catch((error) => {
                    console.error(pluginName+'获取商品列表网页时出错:', error);
                });
            }
        } else {
        console.error(pluginName+'unitList not found in the JavaScript code.');
        }
    })
    .catch((error) => {
        console.error(pluginName+'获取商店网页时出错:', error);
    });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

main()
