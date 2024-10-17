//[title: 二维码]
//[language: es5]
//[class: 工具类]
//[service: Jusbe] 售后联系方式
//[disable:false] 禁用开关，true表示禁用，false表示可用
//[admin: false] 是否为管理员指令
//[rule: ^(生成|识别)二维码$] 匹配规则，多个规则时向下依次写多个
//[cron: 1 1 1 1 1] cron定时，支持5位域和6位域
//[priority: 1] 优先级，数字越大表示优先级越高
//[platform: all] 适用的平台
//[open_source: false]是否开源
//[icon: 图标url]图标链接地址，请使用48像素的正方形图标，支持http和https
//[version: 1.0.0]版本号
//[public: false] 是否发布？值为true或false，不设置则上传aut云时会自动设置为true，false时上传后不显示在市场中，但是搜索能搜索到，方便开发者测试
//[price: 999] 上架价格
//[description: 二维码] 使用方法尽量写具体

//二维码
// url=encodeQR(content,size)//生成二维码,size是二维码图片大小单位像素
// content=decodeQR(url)//将url二维码解析出内容

Debug('\n\n\n\n\n<div style="text-align: center; font-size: 72px; font-weight: bold;">二维码</div>')

const inputTime = 60 // s
const im = GetImType()
const tianapi4 = "e28dfc3cc8dad6b8cdbd55e02199911c"
let fuc = param(1)

function main(){

    if(fuc == "生成"){
        const txt = ShuRu("请输入要生成的文本")
        if(!txt.success) return sendText(txt.msg)

        let img = img_turn(encodeQR(txt.data,512))
        img.success ? sendText(img.data) : sendText(img.msg)

        Debug(`[${im}]图片地址：${img.data}`)
    }else if(fuc == "识别"){
        if(['wx','fs','dd','tg','qb'].includes(im)){ return sendText('当前平台暂未支持读取图片功能')}

        const txt = ShuRu("请回复你要识别的图片")
        if(!txt.success) return sendText(txt.msg)

        let img = {success:null,data:{type:null,data:txt},msg:JSON.stringify(txt)}
        if(['qq','tb'].includes(im)){
            img.data.type = 'url'
            img.data.data = /http.*(?=[,\]])/.exec(txt.data)
            img.success = img.data.data ? true : false
            img.msg = img.success ? '获取用户图片地址成功' : '读取图片失败'
            img.data.data = img.success ? img.data.data[0] : txt.data
        }else if(['kk'].includes(im)){
            img.data.type = 'url'
            img.data.data = /http.*/.exec(txt.data)
            img.success = img.data.data ? true : false
            img.msg = img.success ? '获取用户图片地址成功' : '读取图片失败'
            img.data.data = img.success ? img.data.data[0] : txt.data
        }else{
            img.data.type = 'url'
            img.data.data = /http.*/.exec(txt.data)
            img.success = img.data.data ? true : false
            img.msg = img.success ? '获取用户图片地址成功' : '读取图片失败'
            img.data.data = img.success ? img.data.data[0] : txt.data
        }

        Debug(`[${im}]读取识别图片：${JSON.stringify(img)}`)
        
        if(img.success){
            if(img.data.type == 'url'){
                if(tianapi4){
                    const codecx = codec(img.data.data)
                    Debug(JSON.stringify(codecx))
                    if(codecx.code==200){
                        sendText(`====== 识别${codecx.qrtype} ======\n${codecx.qrcodec}`)
                    }else{
                        sendText(`====== 识别错误 ======\n[${codecx.code}]${codecx.msg}`)
                    }
                }else{
                    decodeQR(img.data.data)
                }
            }
        }else{
            sendText(img.msg)
        }
    }
}

function img_turn(url){
    if(['wx','qq','fs'].includes(im)){
        return {success:true,data:image(url),msg:'成功'}
    }else if(['qb','tb','tg','dd','db'].includes(im)){
        const data = img_2_aut(url)
        if(data.success){
            return {success:true,data:image(data.data),msg:'成功'}
        }else{
            return data
        }
    }else if(['kk'].includes(im)){
        return {success:true,data:`![img](${img_2_aut(url).data})`,msg:'成功'}
    }else{
        return sendText(`请将此消息发给管理员处理：\nIM：${im}\nTEXT：\nURL：${url}`)
    }
}

function img_2_aut(url){
    const img = imageDownload(url, './qrcode.png')

    if (img.success == false) { return {success:false,data:url,msg:'图片读取失败'} }
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
        if (error != null) { return {success:false,data:null,msg:`图片上传失败A：${url}\n${JSON.stringify(error)}`} }
        if (response.statusCode != 200) { return {success:false,data:null,msg:`图片上传失败B${response.statusCode}：${url}\n${JSON.stringify(response)}`} }
        if (response.body.code != 200) {return {success:false,data:null,msg:`图片上传失败C${response.body.code}：${url}\n${JSON.stringify(response)}`} }
        
        return {success:true,data:response.body.result.path,msg:'图片上传成功'}
    })
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
        // RecallMessage(t1);
        sendText(`超时，${inputTime}秒内未回复`)
        return {success:false,data:null,msg:`超时，${inputTime}秒内未回复`}
    } else if (s == "q" || s == "Q") {
        // RecallMessage(t1);
        // Debug('用户退出')
        return {success:false,data:null,msg:"已退出会话"}
    } else {
        // RecallMessage(t1);
        return {success:true,data:s,msg:null}
    }
}

// data = {base64:null,url:null}
function codec(qrurl){
    Debug(`codec qrurl：${qrurl}`)
    

    // if(/^https?:\/\/(10|100|127|192)\..+/.test(qrurl)){
        // 本地图片
        // const auturl = img_2_aut(qrurl)
        // Debug(JSON.stringify(auturl))
        // if(!auturl.success) return {"code":0,"msg":auturl.msg}
        
        const img = imageDownload(qrurl, './qrcode.png')
        Debug(`codec img 下载图片：${JSON.stringify(img)}`)
        let qrpic = img.success ? img.base64 : null
    // }else if(/^https?:\/\/\..+/.test(qrurl)){
        // const img = imageDownload(qrurl, './qrcode.png')
        // Debug(`codec img 下载图片：${JSON.stringify(img)}`)
        // qrpic = img.success ? img.base64 : null
    // }else{
        // return {"code":0,"msg":`图片读取错误：${qrurl}`}
    // }
    
    return request({
        url:"https://apis.tianapi.com/codec/index",
        method:"post",
        headers: {'Content-Type': 'application/x-www-form-urlencoded',},
        formData:{
            qrpic:qrpic,
            key:tianapi4
        },
        dataType:"json",
    },function(error,response,header,body){
        Debug(`codec body 上传天行：${JSON.stringify(body)}`)
        // {"code":260,"msg":"参数值不得为空"}
        // {"code":280,"msg":"缺少必要的参数"}
        return {...body,...body.result}
    })
}

main()
