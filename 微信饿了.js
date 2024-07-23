//[open_source: false]
//[version: 1.0.3]
//[title: 微信饿了]
//[class: 工具类]
//[price: 999]
//[service: Jusbe]
//[admin: false]
//[priority: 1]
//[public: false]
//[bypass: false]
//[disable:true]
//[rule: ^微信饿了$]
//[cron: 0 */4 * * *]
//[description: 插件已下架，不建议新用户购买。老用户有问题可继续反馈<br>自动同步 wxUid 到指定青龙面板的 elmck，适用于老虎本<br>请在配参中指定青龙/设置wxpusher邀请链接，并在青龙中添加"WX_PUSH_TOKEN"]
//[param: {"required":true,"key":"elm_wxpusher.ql_name","bool":false,"placeholder":"如：qinglong","name":"青龙","desc":"容器管理=>对接容器 中的 名称"}]
//[param: {"required":true,"key":"elm_wxpusher.wxpusher_qr_url","bool":false,"placeholder":"如：https://wxpusher.zjiecode.com/api/qrcode/......","name":"wxpusher二维码链接","desc":"创建应用后，在这里获取你的链接：<br>https://wxpusher.zjiecode.com/admin/main/app/appFollow"}]

importJs("qinglong.js")

const bucket_name = "elm_wxpusher"
const key_name = "elmck"
const value_key_name = "wxUid"
// const ql_name = "qinglong"
// const wxpusher_qr_url="https://wxpusher.zjiecode.com/api/qrcode/lDca2YWMruLat4WMeYPF3OEksYCNtscYzGEL8N4Yb7U4wtxjkxrW8TR3W4fV9a5Q.jpg"
const wxpusher_qr_url=bucketGet(bucket_name,"wxpusher_qr_url")
const ql_name=bucketGet(bucket_name,"ql_name")

const inputTime = 60
const recallTime = 60
const errTime = 6

const qls = bucketGet("qinglong","QLS")
const qlDatas = JSON.parse(qls)
const qlDataDefault = qlDatas.find((item) => item.name == ql_name)
const host = qlDataDefault.host
const client_id = qlDataDefault.client_id
const client_secret = qlDataDefault.client_secret
const jv = qlDataDefault.jv
const name = qlDataDefault.name
const enable = qlDataDefault.enable

const ql = Qinglong(host, client_id, client_secret)

const _plugin_name = `【${getTitle()}】` //插件标题
const imType = GetImType()
const userID = GetUserID()
const chatID = GetChatID() //会话群号

function main(){
  if (imType == "fake"){
    let debug_str = _plugin_name
    const user_datas = bucketKeys(bucket_name)
    user_datas.forEach((v,i)=>{
      const keyList = getUserKeys(ql, v)
      sendText(keyList.lenght)
      const _wxUid = bucketGet(bucket_name,v)
      const isOk = addWxUid(keyList,_wxUid)
      debug_str += `\n用户${i+1}：${v}，${key_name} 更新${isOk ? '成功' : '失败' }，UID：${_wxUid}`
    })
    console.debug(debug_str)
    return true
  }else{
    const user_info = bucketGet(bucket_name,userID)
    if(!user_info || user_info == ""){
      const _wxuid = getWxUid()
      if(_wxuid){
        bucketSet(bucket_name,userID,_wxuid)
        sendText(`用户 ${userID} 配置UID成功`)
      }
    }else{
      const _input = ShuRu(`您已配置uid：${user_info}\n（变更 y，退出 q）`)
      switch(_input){
        case "y":
          const _wxuid = getWxUid()
          if(_wxuid){
            bucketSet(bucket_name,userID,_wxuid)
            sendText(`用户 ${userID} 配置UID成功`)
          }
          break;
        case false:
          break;
        default:
          sendErr("输入错误")
          break;
      }
    }
  }
}

function getWxUid(){
  if(!wxpusher_qr_url || wxpusher_qr_url == '' ) return sendErr("未配置二维码，请联系管理员")
  const _input = ShuRu(`请使用微信扫码关注后，回复你的 uid：[CQ:image,file=${wxpusher_qr_url}]`)
  if(_input && _input.search(/UID_\w+/)+1) return _input
  if(!_input) return false
  return sendErr("格式错误，请重新发起命令")
}

function addWxUid(keyList,wxUid){
  // let debug_str = _plugin_name
  let success = false
  keyList.forEach((v,i)=>{
    const value_ary = v.value.replace(/ /g,'').split(';')
    const value_data = {}
    value_ary.forEach(item => {
      const [key, value] = item.split('=')
      if(key && value) value_data[key] = value
    })
    value_data[value_key_name] = wxUid
    let _value = ""
    for(let item in value_data){
      _value += `${item}=${value_data[item]};`
    }
    const { id, name, remarks, value } = v
    const param = {id, remarks, value: _value, name}
    const { code } = ql.ApiQL("envs", "?t=" + Date.now(), "put", param)
    if(code === 200) success = true
    // debug_str += `\n[${i+1}] ${remarks.match(/\w+/)} ${value_key_name} 添加`
    // debug_str += code === 200 ? '成功' : '失败'
    // console.debug(debug_str)
  })
  return success
}

function fake(){
  return
}

function getUserKeys(ql, remarks_key){
  const { data } = ql.ApiQL("envs","?searchValue=&t=" + Date.now(), "get", "")
  const keyList = data.filter(v => v.name === key_name && v.remarks.search(remarks_key)+1)
  return keyList
}

function ShuRu(tap) {
  let t1 = sendText(tap)
  let s = input(inputTime*1000, 3000)
  if (s == null || s == '') {
      RecallMessage(t1);
      return sendErr(`超时，${inputTime}秒内未回复`)
  } else if (s == "q" || s == "Q") {
      RecallMessage(t1);
      return sendErr("已退出会话");
  } else {
      RecallMessage(t1);
      return s;
  }
}

function sendErr(tap){
  let s = sendText(tap)
  sleep(errTime*1000)
  RecallMessage(s)
  return false
}

function sendRecall(tap){
  let s = sendText(tap)
  sleep(recallTime*1000)
  RecallMessage(s)
  return true
}

main()
