//[title: 通过好友请求]
//[class: 工具类]
//[platform: wx,qq]
//[price: 999]
//[admin: false]
//[priority: 1]
//[public: false]
//[bypass: false]
//[disable: false]
//[event: qq-request-friend]
//[rule: raw ^你已添加了(.+)，现在可以开始聊天了。$]
//[description: 1]

const wxGroupID = '44266589552' //@chatroom

const _plugin_name = `【${getTitle()}】` //插件标题
const imType = GetImType()
const userID = GetUserID()
const chatID = GetChatID() //会话群号
const param1 = param(1)
const userName = GetUsername()

const eventData = getEventData() // 自助/无事件EventData时为 null
const eventObj = JSON.parse(eventData)

function main(){
  console.log(`${_plugin_name}\n${eventData}`)
  if(eventData){
    if(eventObj.request_type != "friend") return false
    push({imType: "qq",userID: eventObj.user_id,content: "欢迎使用本机器人功能\n主群：484584515\n给我发“菜单”查看所有功能\n加V使用更方便[CQ:image,file=https://z4a.net/images/2023/09/07/autMan_wx_QRCode.png]"})
    return true
  }
  if(imType == "wx"){
    if(chatID) return false
    // if(param1 != userName) return false
    breakIn("群导航")
    sleep(1000)
    sendText("现在邀请你进主群（未加群将拉黑）\n给我发“菜单”查看所有功能")
    sleep(1000)
    GroupInviteIn(userID,wxGroupID)
    return true
  }
}


main()

/*
//[event: wx-vlw-EventPrivateChat]
//[event: wx-EventPrivateChat]

{"scene":0,"headimgurl":"http:\/\/wx.qlogo.cn\/mmhead\/ver_1\/prnLd6ypvibkk9G2nqo5B596icbib6qFgcwqWqBCvLlXeoEOhJHhbNmIsjkcFSwUhPh7yamjJgWjDBicLf9ic9Kuweg\/0","from_content":"我是Jusbe","from_group_wxid":"","share_wxid":"","share_nickname":"","v1":"v3_020b3826fd03010000000000bde62d6f5627c6000000501ea9a3dba12f95f6b60a0536a1adb63ba691b644a0f3cddaabd3aa9677093331f364e6c0724f109df9d2a628d7ee511abb37753af02d36e1f38a3f62@stranger","v2":"v4_000b708f0b04000001000000000093296e2a6d8cf28042e790ccfd641000000050ded0b020927e3c97896a09d47e6e9ebf3c42430600c7a081d47414d545cde82dde1196e55e00fdb1112672a3a3adf483552a7b1fc1a130d40b4b5b78015899c629d7631cc61ae523ae82fe5e12dc3bc1eb2fe3dfe6f7ac856e5b29287d4c5e3aeb0c3d16d8a9a413e5faa1883b3855dd82ff6b275c5c3b74@stranger","sex":1,"content":"我是Jusbe"}

url：
http://192.168.1.13:8080/wx/receive

Response：


Send：
{"sdkVer":6,"Event":"EventFrieneVerify","content":{"robot_wxid":"wxid_eesj7yvm9ebc22","type":6,"from_wxid":"Liksbe","from_name":"Jusbe","v1":"v3_020b3826fd03010000000000bde62d6f5627c6000000501ea9a3dba12f95f6b60a0536a1adb63ba691b644a0f3cddaabd3aa9677093331f364e6c0724f109df9d2a628d7ee511abb37753af02d36e1f38a3f62@stranger","v2":"v4_000b708f0b04000001000000000093296e2a6d8cf28042e790ccfd641000000050ded0b020927e3c97896a09d47e6e9ebf3c42430600c7a081d47414d545cde82dde1196e55e00fdb1112672a3a3adf483552a7b1fc1a130d40b4b5b78015899c629d7631cc61ae523ae82fe5e12dc3bc1eb2fe3dfe6f7ac856e5b29287d4c5e3aeb0c3d16d8a9a413e5faa1883b3855dd82ff6b275c5c3b74@stranger","json_msg":{"scene":0,"headimgurl":"http://wx.qlogo.cn/mmhead/ver_1/prnLd6ypvibkk9G2nqo5B596icbib6qFgcwqWqBCvLlXeoEOhJHhbNmIsjkcFSwUhPh7yamjJgWjDBicLf9ic9Kuweg/0","from_content":"我是Jusbe","from_group_wxid":"","share_wxid":"","share_nickname":"","v1":"v3_020b3826fd03010000000000bde62d6f5627c6000000501ea9a3dba12f95f6b60a0536a1adb63ba691b644a0f3cddaabd3aa9677093331f364e6c0724f109df9d2a628d7ee511abb37753af02d36e1f38a3f62@stranger","v2":"v4_000b708f0b04000001000000000093296e2a6d8cf28042e790ccfd641000000050ded0b020927e3c97896a09d47e6e9ebf3c42430600c7a081d47414d545cde82dde1196e55e00fdb1112672a3a3adf483552a7b1fc1a130d40b4b5b78015899c629d7631cc61ae523ae82fe5e12dc3bc1eb2fe3dfe6f7ac856e5b29287d4c5e3aeb0c3d16d8a9a413e5faa1883b3855dd82ff6b275c5c3b74@stranger","sex":1,"content":"我是Jusbe"},"robot_type":0}}

GET
token=12345&api=AgreeFriendVerify&robot_wxid=wxid_eesj7yvm9ebc22&v1=v3_020b3826fd03010000000000bde62d6f5627c6000000501ea9a3dba12f95f6b60a0536a1adb63ba691b644a0f3cddaabd3aa9677093331f364e6c0724f109df9d2a628d7ee511abb37753af02d36e1f38a3f62@stranger&v2=v4_000b708f0b04000001000000000093296e2a6d8cf28042e790ccfd641000000050ded0b020927e3c97896a09d47e6e9ebf3c42430600c7a081d47414d545cde82dde1196e55e00fdb1112672a3a3adf483552a7b1fc1a130d40b4b5b78015899c629d7631cc61ae523ae82fe5e12dc3bc1eb2fe3dfe6f7ac856e5b29287d4c5e3aeb0c3d16d8a9a413e5faa1883b3855dd82ff6b275c5c3b74@stranger&type=6

url：
http://192.168.1.13:8080/wx/receive

Response：


Send：
{"sdkVer":6,"Event":"EventPrivateChat","content":{"robot_wxid":"wxid_eesj7yvm9ebc22","type":10000,"from_wxid":"Liksbe","from_name":"Jusbe","msg":"你已添加了Jusbe，现在可以开始聊天了。","clientid":0,"robot_type":0,"msg_id":"2406572723896785674"}}

*/