//[title: bili]
//[class: 工具类]
//[version: 0.0.1]
//[admin: false]
//[rule: ^bili$]
//[public: false]
//[disable:false]
//[price: 999]
//[priority: 1]
//[platform: all]
//[service: Jusbe]
//[description: 内测<br>命令：bili（可自定义）<br>功能：对接在七楼的扫码登录]
//[param: {"required":true,"key":"bili.ql_name","bool":false,"placeholder":"如：qinglong","name":"容器名称","desc":"容器管理-对接容器 里的名称"}]

Debug('\n\n\n\n\n<div style="text-align: center; font-size: 72px; font-weight: bold;">Bilibili</div>')

function main(){
    try{
        importJs('jusapi.js')
    }catch(e){
        throw new Error('请在插件市场安装“jusapi”');
        // Debug('请在插件市场安装“jusapi”')
        // process.exit()
    }
    
    const ql_name = bucketGet("bili","ql_name")
    const ql_data = getQLbyName(ql_name)
    const ql = new QingLong(ql_data.host,ql_data.client_id,ql_data.client_secret)
    
    const cron_keyword = '_task_login'
    const cron_data = ql.getCrons(cron_keyword)[0]
    const cron_status = cron_data.status
    const cron_id = cron_data.id
    
    if(cron_status == 0) {
        Debug('脚本运行中，退出')
        return sendErr('任务运行中，请稍后尝试')
    }else if(cron_status == 1){
        Debug('脚本空闲，即将运行')
    }else{
        Debug('脚本状态异常：'+cron_status)
        return sendErr('脚本状态异常：'+cron_status)
    }
  
    const cron_put = ql.runCrons([cron_id])
    Debug(`等待 ${errTime} 秒`)
    sendErr('正在获取二维码。很慢，请稍等（q 退出）')
sleep(6000)
    const cron_logs = ql.getLogsByName(cron_keyword)
//sendText(cron_logs.map(v=>{return v.title}).join("\n"))
    const {parent,title} = cron_logs[0]
    sendText(title)
    let qr_url = null
    for(let i = 0;i<recallTime;i+=3){
        const quit = input(10000,3000)
        if(/^[Qq]$/.test(quit)) {rebug('获取二维码用户退出');ql.stopCrons([cron_id]);return sendErr('退出')}

        const content = ql.getLog(parent,title)
        qr_url = content.match(/https:\/\/tool\.lu\/qrcode\/basic\.html.*/)
        //sendText(`二维码地址：${qr_url}`)
        if (qr_url != null) break
    }
    if (qr_url == null) return sendErr('二维码获取失败')

    // const qr_body = new Object({
    //     text:decodeURI(qr_url[0].match(/(?<=\?text=).*/)[0]),
    //     tolerance: 30,
    //     size: 512,
    //     margin: 0,
    //     front_color: '#000000',
    //     background_color: '#ffffff',
    //     logo:'lFtLX6Ao3QCXEM/csT0fOKHff090KZcuWhBk/kVj1vmLufaLcNXIjQhh//ghTG86yJIZzDZif8FFBn1ePWJxNJkkWMeAqZonqKl/iI51ZrCBvV0DG/yVLTX+TzbjOsDyRCaqL2A5TEKjSa4gButJGqQ9arKGOEvDBv9xEfh/YZmveApaV154GkuVlJ++DCInOTnO99oiS6HKAEUnwQy3qA=='
    // })

    // request({
    //     url:'https://tool.lu/qrcode/basic.html',
    //     motho
    // })
    // const url='https://tool.lu/qrcode/basic.html?'
    // const params = new Array()
    // for(let a in qr_body){
    //     params.push(`${a}=${qr_body[a]}`)
    // }
    // const qr_img = img_url2aut(url.concat(params.join('&')))
    
    const text = qr_url[0].match(/(?<=\?text=)\S*/)[0]
    const qr_enrul = encodeQR(text,512)
    sendText(`登录地址：${text}`)
    rebug(`二维码地址：${qr_enrul}`)
    //在 系统参数-基本-域名或公网地址 中设置autHost
    const msg = sendText(`请使用 bilibili 手机客户端扫码二维码登录（q 退出）：${image(qr_enrul)}`)

    let qr_success = null
    for(let i = 10;i<210;i+=10){
        Debug(`等待扫描... ${i} 秒`)
        const quit = input(10000,3000)
        if(/^[Qq]$/.test(quit)) {rebug('等待扫描用户退出');ql.stopCrons([cron_id]);return sendErr('退出')}

        const content = ql.getLog(parent,title)
        qr_success = content.match(/扫描成功/)
        if (qr_success != null) break
    }
    RecallMessage(msg)
    if (qr_success == null) return sendErr('扫描失败')

    Debug('扫描成功！')
    sendRecall('扫描成功！正在登记到服务器...')
    const content = ql.getLog(parent,title)
    const bili_key = content.match(/Ray_BiliBiliCookies.*/)

    sendRecall('登录成功')
    Debug(`[${GetImType()}]${GetUserID()} 登录成功，Key：${bili_key}`)
}

main()
Debug('============== End ==============')
