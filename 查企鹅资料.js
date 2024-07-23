//[title: 查企鹅资料]
//[class: 工具类]
//[platform: qq]
//[platform: wx]
//[platform: tb]
//[platform: tg]
//[platform: web]
//[platform: wxmp]
//[price: 999]
//[rule: ^查资料 ?]
//[priority: 1]
function main() {
  var str = param(1) 
  let tagName = {
    province:'省籍',
    email:'邮箱',
    sign:'签名',
    age:'年龄',
    gender:'性别',
    clike:'人气',
    level:'等级',
    name:'姓名',
    country:'国家',
    city:'城市',
    imgurl:'QQ头像',
    qzoneimgurl:'QZone头像'
  }
  data = request({ 
    url: "https://api.txcnm.cn/api/qqxl/qq_cxzl?key=dv6TerJsI0PBcEnk0REEy4kTE5&qq="+str, 
    //请求链接
    "method": "get",
    //请求方法
    "dataType": "json",
    //返回json
    })
    _n = 'QQ：' + str + '\n----------------------'
    for (tag in data.data){
      if(tag == "imgurl" || tag == "qzoneimgurl"){
        sendText(`[CQ:image,file=${data.data[tag]}]`)
      }else{
        _n += `\n${tagName[tag]}：${data.data[tag]}`

      }
    }
    // _n += '\nsign：' + data.data.sign
    // _n += '\nclike：' + data.data.clike
    // _n += '\nlevel：' + data.data.level
    // _n += '\nemail：' + data.data.email
    // _n += '\nname：' + data.data.name
    // _n += '\nage：' + data.data.age
    // _n += '\ngender：' + data.data.gender
    // _n += '\ncountry：' + data.data.country
    // _n += '\nprovince：' + data.data.province
    // _n += '\ncity：' + data.data.city
    sendText(_n)
}
main()

