// [title: 鄞响库存监控]
// [class: 查询类]
// [rule: ^鄞响库存$]
// [cron: 2 0 * * *]
// [priority: 1]
// [admin: true]
// [disable: false]


async function main(){
    const black_group = [25057,25058]
    const middleware = await require('./middleware.js');
    const axios = await require('axios');

    const senderID = await middleware.getSenderID();
    const s = await new middleware.Sender(senderID)
    const pluginName = `【${await s.getPluginName()}】`

    // 自定义标头
    const headers = {
        'Cookie': 'deap=OTQ3NTEtSlBiR0sya0hYSnc4bTIyV0s1RVdMY2Q4REpzbjZ4ckZHTDhpRFpaVGczMDA4OQ..;createdAtToday=false;isNotLoginUser=false;wdata4=sEPXL6yNmw3i4q72DaweWiQczEykwerY2MioVjuHX9w6xorSFovHxHrQpgt7tIcgwAwfLbmfVou8mMWg7uap4vt/bUKbQGm2pTEebjnIHshDPSSUvRVbeQTdvefDINv1kQKSD+hTqVyVUqwUrPgrM8xfKTlGy/rsHcroB6VG9uQ=;w_ts=1696438907853;_ac=eyJhaWQiOjk0NzUxLCJjaWQiOjQwMDM4OTU1MTZ9;tokenId=29eeca0eb6a5832632dafbbf3ae377c4;wdata3=fu4NJvzsSSnRB6vxHcpNaJf8HrLWVXZM5JMXPJbdo1Vxtx55oi3kBEfBUpLdJkDmQTTda9pbKGkg1FJLJkJsNcpe9TnyT8TyBPbYihYNK6DUaFxiFvprAJw4UuaJqnuVmh3eFfaCkzcPP3QkG2CgGAFwj;dcustom=registerTime%253D2023-06-13%2B11%253A34%253A48%2526phone%253D13059521583%2526newUser%253D0%2526nickname%253DJuxbe%2526avatar%253D%2526sessionId%253D651d9a62f34e1650b37a25c1'
        // 'Cookie': '_ac=eyJhaWQiOjk0NzUxLCJjaWQiOjQwMzA3MzU2MDZ9;createdAtToday=true;isNotLoginUser=false;dcustom=registerTime%253D2023-07-11%2B21%253A42%253A45%2526phone%253D13202300853%2526newUser%253D0%2526nickname%253D132***0853%2526avatar%253D%2526sessionId%253D64ad5c55a7fd39181ebbfde6;deap=OTQ3NTEtSlBiR0sya0hYSnc4bTIyV0s1RVdMY2Q4REpzbjZ4ckZHTDhpRFpaVGczMDA4OQ..;wdata4=J2M/d9VusR07jncEA+VFb3AeBEUUILSwHerHnFw3aVlMR8OkCkPhWn0m0pJwz2KAjioew2QpG10bJiStsePiTR4vlzMLFYD6CYDrnP6F1TfNxHxQjwycg6Spk5I3esjl/lp4Gwv9N81q+qRCJXSa1/Y32/56zxe9ZcdQytRCsxo=;w_ts=1696333771681;tokenId=f5ed0f673b65fb0e4542bc0dadf956be;wdata3=fu4NJvzsSSnRB6vxHcpNaJf8HrLWVXZM34v32zFTT3Tfsj2pXBwX2HmiQH89yTAnSQGiGA36UB7Fdq7eAKRg6jAxkvf8DGwz1vvybCBsd5SfbjkFGQQ1hH5Tp6EnyawbuAZJWDx5GRewVis9Ja447GtQk'
    };

    // 发送GET请求并包括自定义标头
    await axios.get('https://94751.activity-42.m.duiba.com.cn/chw/visual-editor/skins?id=301688', { headers })
    .then((response) => {
        const html = response.data;

        // 使用正则表达式提取JavaScript中的groupId数据
        const regex = /(?<=\"groupId\"\:)(\d+)/g;
        const groupIds = html.match(regex);
        // console.debug(pluginName+groupIds)

        if (groupIds && groupIds[1]) {
            console.debug(pluginName+'商品分类列表：'+groupIds);
            for(let i = 0; i<groupIds.length; i++){
                if(black_group.includes(groupIds[i]*1)) break
                const gn_reg = /(?<=\"groupName\"\:\")([^\"]+)/g;
                const groupName = html.match(gn_reg)[i];
                // console.debug(pluginName+groupName.toString());

                const host = 'https://94751.activity-42.m.duiba.com.cn/chw/visual-editor/items/list?classifyId='+groupIds[i]
                axios.get(host, { headers })
                .then(async (response) => {
                    const data = response.data;
                    if(data.success == true){
                        const list = data.data.list
                        let str = `${pluginName}${groupName}\n----------------------\n`
                        let _ary = []
                        for(let a = 0; a<list.length; a++){
                            //商品详情页检测
                            const host = 'https://94751.activity-42.m.duiba.com.cn/mobile/detail?appItemId='+list[a]['id']
                            await axios.get(host, { headers })
                            .then((response) => {
                                const html = response.data;

                                const lock_reg = /(?<=\"lock\"\:)(\w+)/s;
                                let lock = html.match(lock_reg);
                                if(lock){
                                    lock = lock[0]
                                    // console.debug(pluginName+'lock：'+lock);
                                    if(lock == false || lock == 'false'){
                                        const reg1 = /(?<=\"remaining\"\:)(\d+)/s;
                                        console.debug(`${pluginName}${host}`)
                                        const currentStock = html.match(reg1)[0];

                                        const reg2 = /(?<=\"totalStock\"\:)(\d+)/s;
                                        const currentTotalStock = html.match(reg2)[0];

                                        const _s = `${list[a]['credits']}🎁${list[a]['title']}`
                                        _ary.push(_s)
                                        console.debug(`${pluginName}${list[a]['title']}，库存：${currentStock}/${currentTotalStock}`);
                                    }else{console.debug(`${pluginName} 跳过 ${list[a]['title']}`)}
                                }else{console.debug(`${pluginName} 跳过 ${list[a]['title']}`)}
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
                        await middleware.push('qb', 549998515, 0, '鄞响库存', str) //频道
                        // await middleware.push('qq', 315519023, 0, '', str) //测试
                        // console.debug(pluginName+str)
                    }else{
                        console.error(pluginName+'商品列表返回失败');
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
