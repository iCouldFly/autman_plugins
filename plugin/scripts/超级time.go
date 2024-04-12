//[title: 超级time]
//[language: golang]
//[class: 工具类]
//[price: 0] 优先级，数字越大表示优先级越高
//[service: jusbe] 售后联系方式
//[disable: false] 禁用开关，true表示禁用，false表示可用
//[admin: false] 是否为管理员指令
//[rule: ^time$] 匹配规则，多个规则时向下依次写多个
//[priority: 1] 优先级，数字越大表示优先级越高
//[version: 1.0.0]版本号
//[public: false] 是否发布？值为true或false，不设置则上传aut云时会自动设置为true，false时上传后不显示在市场中，但是搜索能搜索到，方便开发者测试
//[price: 999] 上架价格
//[description: 关于插件的描述] 使用方法尽量写具体

package main

import (
    "fmt"
    "time"
	"os"

	"github.com/hdbjlizhe/middleware"
)

func main() {
	//给中间件设置端口号
	port := os.Args[1]     //autMan端口
	senderId := os.Args[2] //发送者id

	fmt.Println("port:", port)
	fmt.Println("senderId:", senderId)
	middleware.Port = port

	//创建对象
	sender := middleware.Sender{
		SenderID: senderId,
	}

	// groupCode := sender.GetChatID()
	// groupName := sender.GetChatName()
	// userID := sender.GetUserID()
	// username := sender.GetUsername()

    // 获取当前时间
    now := time.Now()
    // 设置时间格式
    layout := "2006-01-02 15:04:05.000000000"
    output := now.Format(layout)
    fmt.Println(output)

	sender.Reply(output)
}

// /////////////////////////////////////////////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////////////////////////////////
// var Port string

// func localUrl() string {
// 	return "http://localhost:" + Port + "/otto"
// }

// /**
//  * @description: 设置端口号
//  */
// func SetPort() {
// 	Port = os.Args[1]
// }

// /**
//  * @description: 获取消息发送者ID
//  * @return {string}
//  */
// func GetSenderID() string {
// 	return os.Args[2]
// }

// /**
//  * @description: 推送消息
//  * @param {string} imtType 包括：qq/qb/wx/wb/tg/tb/wxmp/wxsv
//  * @param {string} groupCode 群号
//  * @param {string} userID 用户ID
//  * @param {string} title 标题
//  * @param {string} content 内容
//  * @return {*}
//  */
// func Push(imType, groupCode, userID, title, content string) error {
// 	params := map[string]interface{}{
// 		"imType":    imType,
// 		"groupCode": groupCode,
// 		"userID":    userID,
// 		"title":     title,
// 		"content":   content,
// 	}
// 	body, _ := json.Marshal(params)
// 	_, err := httplib.Post(localUrl()+"/push").Header("Content-Type", "application/json").Body(body).Bytes()
// 	if err != nil {
// 		return err
// 	} else {
// 		return nil
// 	}
// }

// /**
//  * @description: 获取autMan名字
//  */
// func Name() string {
// 	resp, _ := httplib.Post(localUrl()+"/name").Header("Content-Type", "application/json").Bytes()
// 	name, _ := jsonparser.GetString(resp, "data")
// 	return name
// }

// /**
//  * @description: 获取autMan机器码
//  */
// func MachineId() string {
// 	resp, _ := httplib.Post(localUrl()+"/machineId").Header("Content-Type", "application/json").Bytes()
// 	rlt, _ := jsonparser.GetString(resp, "data")
// 	return rlt
// }

// /**
//  * @description: 获取autMan版本，结果是json字符串{"sn":"1.9.8","content":["版本更新内容1","版本更新内容2"]}
//  */
// func Version() string {
// 	resp, _ := httplib.Post(localUrl()+"/version").Header("Content-Type", "application/json").Bytes()
// 	rlt, _ := jsonparser.GetString(resp, "data")
// 	return rlt
// }

// /**
//  * @description: 获取用户otto数据库key-value的value值
//  * @param {string} key
//  */
// func Get(key string) string {
// 	params := map[string]interface{}{
// 		"key": key,
// 	}
// 	body, _ := json.Marshal(params)
// 	resp, _ := httplib.Post(localUrl()+"/get").Header("Content-Type", "application/json").Body(body).Bytes()
// 	rlt, _ := jsonparser.GetString(resp, "data")
// 	return rlt
// }

// /**
//  * @description: 设置用户otto数据库key-value的value值
//  * @param {string} key
//  * @param {string} value
//  */
// func Set(key, value string) error {
// 	params := map[string]interface{}{
// 		"key":   key,
// 		"value": value,
// 	}
// 	body, _ := json.Marshal(params)
// 	if _, err := httplib.Post(localUrl()+"/set").Header("Content-Type", "application/json").Body(body).Bytes(); err != nil {
// 		return err
// 	} else {
// 		return nil
// 	}
// }

// /**
//  * @description: 删除用户otto数据库key-value的value值
//  * @param {string} key
//  */
// func Delete(key string) error {
// 	params := map[string]interface{}{
// 		"key": key,
// 	}
// 	body, _ := json.Marshal(params)
// 	if _, err := httplib.Post(localUrl()+"/delete").Header("Content-Type", "application/json").Body(body).Bytes(); err != nil {
// 		return err
// 	} else {
// 		return nil
// 	}
// }

// /**
//  * @description: 获取数据库key-value的value值
//  * @param {string} bucket
//  * @param {string} key
//  */
// func BucketGet(bucket, key string) string {
// 	params := map[string]interface{}{
// 		"bucket": bucket,
// 		"key":    key,
// 	}
// 	body, _ := json.Marshal(params)
// 	resp, _ := httplib.Post(localUrl()+"/bucketGet").Header("Content-Type", "application/json").Body(body).Bytes()
// 	rlt, _ := jsonparser.GetString(resp, "data")
// 	return rlt
// }

// /**
//  * @description: 设置数据库key-value的value值
//  * @param {string} bucket
//  * @param {string} key
//  * @param {string} value
//  */
// func BucketSet(bucket, key, value string) error {
// 	params := map[string]interface{}{
// 		"bucket": bucket,
// 		"key":    key,
// 		"value":  value,
// 	}
// 	body, _ := json.Marshal(params)
// 	if _, err := httplib.Post(localUrl()+"/bucketSet").Header("Content-Type", "application/json").Body(body).Bytes(); err != nil {
// 		return err
// 	} else {
// 		return nil
// 	}
// }

// /**
//  * @description: 删除数据库key-value的value值
//  * @param {string} bucket
//  * @param {string} key
//  */
// func BucketDelete(bucket, key string) error {
// 	params := map[string]interface{}{
// 		"bucket": bucket,
// 		"key":    key,
// 	}
// 	body, _ := json.Marshal(params)
// 	if _, err := httplib.Post(localUrl()+"/bucketDel").Header("Content-Type", "application/json").Body(body).Bytes(); err != nil {
// 		return err
// 	} else {
// 		return nil
// 	}
// }

// /**
//  * @description: 获取指定数据库的所有为value的keys
//  * @param {string} bucket
//  * @param {string} value
//  */
// func BucketKeys(bucket, value string) []string {
// 	params := map[string]interface{}{
// 		"bucket": bucket,
// 		"value":  value,
// 	}
// 	body, _ := json.Marshal(params)
// 	resp, _ := httplib.Post(localUrl()+"/bucketKeys").Header("Content-Type", "application/json").Body(body).Bytes()
// 	data, _ := jsonparser.GetString(resp, "data")
// 	rlt := []string{}
// 	json.Unmarshal([]byte(data), &rlt)
// 	return rlt
// }

// /**
//  * @description: 获取指定数据桶所有的key集合
//  * @param {string} bucket
//  */
// func BucketAllKeys(bucket string) []string {
// 	params := map[string]interface{}{
// 		"bucket": bucket,
// 	}
// 	body, _ := json.Marshal(params)
// 	resp, _ := httplib.Post(localUrl()+"/bucketAllKeys").Header("Content-Type", "application/json").Body(body).Bytes()
// 	fmt.Println(string(resp))
// 	data, _ := jsonparser.GetUnsafeString(resp, "data")
// 	rlt := []string{}
// 	json.Unmarshal([]byte(data), &rlt)
// 	return rlt
// }

// /**
//  * @description: 通知管理员
//  * @param {string} content
//  * @param {string} imtypes
//  */
// func NotifyMasters(content string, imtypes []string) error {
// 	params := map[string]interface{}{
// 		"content": content,
// 		"imtypes": imtypes,
// 	}
// 	body, _ := json.Marshal(params)
// 	if _, err := httplib.Post(localUrl()+"/notifyMasters").Header("Content-Type", "application/json").Body(body).Bytes(); err != nil {
// 		return err
// 	} else {
// 		return nil
// 	}
// }

// /**
//  * @description: 当前系统授权的激活状态
//  */
// func Coffee() bool {
// 	resp, _ := httplib.Post(localUrl()+"/coffee").Header("Content-Type", "application/json").Bytes()
// 	rlt, _ := jsonparser.GetBoolean(resp, "data")
// 	return rlt
// }

// /**
//  * @description: 京东、淘宝、拼多多的转链推广
//  * @param {string} msg
//  * @return {string} 转链后的信息
//  */
// func Promotion(msg string) string {
// 	params := map[string]interface{}{
// 		"msg": msg,
// 	}
// 	body, _ := json.Marshal(params)
// 	resp, _ := httplib.Post(localUrl()+"/spread").Header("Content-Type", "application/json").Body(body).Bytes()
// 	rlt, _ := jsonparser.GetString(resp, "data")
// 	return rlt
// }

// type Sender struct {
// 	SenderID int64
// }

// func (s *Sender) GetImtype() string {
// 	params := map[string]interface{}{
// 		"senderid": s.SenderID,
// 	}
// 	body, _ := json.Marshal(params)
// 	resp, _ := httplib.Post(localUrl()+"/getImtype").Header("Content-Type", "application/json").Body(body).Bytes()
// 	rlt, _ := jsonparser.GetString(resp, "data")
// 	return rlt
// }

// func (s *Sender) GetUserID() string {
// 	params := map[string]interface{}{
// 		"senderid": s.SenderID,
// 	}
// 	body, _ := json.Marshal(params)
// 	resp, _ := httplib.Post(localUrl()+"/getUserID").Header("Content-Type", "application/json").Body(body).Bytes()
// 	rlt, _ := jsonparser.GetString(resp, "data")
// 	return rlt
// }

// func (s *Sender) GetUsername() string {
// 	params := map[string]interface{}{
// 		"senderid": s.SenderID,
// 	}
// 	body, _ := json.Marshal(params)
// 	resp, _ := httplib.Post(localUrl()+"/getUsername").Header("Content-Type", "application/json").Body(body).Bytes()
// 	rlt, _ := jsonparser.GetString(resp, "data")
// 	return rlt
// }

// func (s *Sender) GetUserAvatarUrl() string {
// 	params := map[string]interface{}{
// 		"senderid": s.SenderID,
// 	}
// 	body, _ := json.Marshal(params)
// 	resp, _ := httplib.Post(localUrl()+"/getUserAvatarUrl").Header("Content-Type", "application/json").Body(body).Bytes()
// 	rlt, _ := jsonparser.GetString(resp, "data")
// 	return rlt
// }

// func (s *Sender) GetChatID() int64 {
// 	params := map[string]interface{}{
// 		"senderid": s.SenderID,
// 	}
// 	body, _ := json.Marshal(params)
// 	resp, _ := httplib.Post(localUrl()+"/getChatID").Header("Content-Type", "application/json").Body(body).Bytes()
// 	rlt, _ := jsonparser.GetInt(resp, "data")
// 	return rlt
// }

// func (s *Sender) GetChatName() string {
// 	params := map[string]interface{}{
// 		"senderid": s.SenderID,
// 	}
// 	body, _ := json.Marshal(params)
// 	resp, _ := httplib.Post(localUrl()+"/getChatName").Header("Content-Type", "application/json").Body(body).Bytes()
// 	rlt, _ := jsonparser.GetString(resp, "data")
// 	return rlt
// }

// func (s *Sender) IsAdmin() bool {
// 	params := map[string]interface{}{
// 		"senderid": s.SenderID,
// 	}
// 	body, _ := json.Marshal(params)
// 	resp, _ := httplib.Post(localUrl()+"/isAdmin").Header("Content-Type", "application/json").Body(body).Bytes()
// 	rlt, _ := jsonparser.GetBoolean(resp, "data")
// 	return rlt
// }

// func (s *Sender) GetMessage() string {
// 	params := map[string]interface{}{
// 		"senderid": s.SenderID,
// 	}
// 	body, _ := json.Marshal(params)
// 	resp, _ := httplib.Post(localUrl()+"/getMessage").Header("Content-Type", "application/json").Body(body).Bytes()
// 	rlt, _ := jsonparser.GetString(resp, "data")
// 	return rlt
// }

// /*
// * @description: 获取消息ID
// * @return {string} 消息ID
//  */
// func (s *Sender) GetMessageID() string {
// 	params := map[string]interface{}{
// 		"senderid": s.SenderID,
// 	}
// 	body, _ := json.Marshal(params)
// 	resp, _ := httplib.Post(localUrl()+"/getMessageID").Header("Content-Type", "application/json").Body(body).Bytes()
// 	rlt, _ := jsonparser.GetString(resp, "data")
// 	return rlt
// }

// /*
// * @description: 撤回用户消息
// * @param {string} messageid 消息ID
//  */
// func (s *Sender) RecallMessage(messageid string) error {
// 	params := map[string]interface{}{
// 		"senderid":  s.SenderID,
// 		"messageid": messageid,
// 	}
// 	body, _ := json.Marshal(params)
// 	if _, err := httplib.Post(localUrl()+"/recallMessage").Header("Content-Type", "application/json").Body(body).Bytes(); err != nil {
// 		return err
// 	} else {
// 		return nil
// 	}
// }

// /*
// * @description: 即，模拟当前用户的身份，修改用户输入的内容，将新内容注入到消息队列中，多用于通过关键词拉起其他插件或任务
// * @param {string} content 消息内容
//  */
// func (s *Sender) BreakIn(content string) error {
// 	params := map[string]interface{}{
// 		"senderid": s.SenderID,
// 		"text":     content,
// 	}
// 	body, _ := json.Marshal(params)
// 	if _, err := httplib.Post(localUrl()+"/breakIn").Header("Content-Type", "application/json").Body(body).Bytes(); err != nil {
// 		return err
// 	} else {
// 		return nil
// 	}
// }

// /*
// * @description: 获取用户触发的关键词，对应头注中rule规则中的小括号或问号
// * @param {int} index 参数索引
// * @return {string} 参数值
//  */
// func (s *Sender) Param(index int) string {
// 	params := map[string]interface{}{
// 		"senderid": s.SenderID,
// 		"index":    index,
// 	}
// 	body, _ := json.Marshal(params)
// 	resp, _ := httplib.Post(localUrl()+"/param").Header("Content-Type", "application/json").Body(body).Bytes()
// 	rlt, _ := jsonparser.GetString(resp, "data")
// 	return rlt
// }

// /*
// * @description: 回复文本
// * @param {string} text 文本内容，文本中可以使用CQ码，例如：[CQ:at,qq=123456]，[CQ:image,file=xxx.jpg]
//  */
// func (s *Sender) Reply(text string) ([]string, error) {
// 	params := map[string]interface{}{
// 		"senderid": s.SenderID,
// 		"text":     text,
// 	}
// 	body, _ := json.Marshal(params)
// 	var msgIds []string
// 	if resp, err := httplib.Post(localUrl()+"/sendText").Header("Content-Type", "application/json").Body(body).Bytes(); err == nil {
// 		if data, err := jsonparser.GetString(resp, "data"); err == nil {
// 			json.Unmarshal([]byte(data), &msgIds)
// 			return msgIds, nil
// 		}
// 	}
// 	return nil, errors.New("回复失败")
// }

// /*
// * @description: 回复图片
// * @param {string} imageurl 图片链接
// * @return {[]string} 消息ID
//  */
// func (s *Sender) ReplyImage(imageurl string) ([]string, error) {
// 	params := map[string]interface{}{
// 		"senderid": s.SenderID,
// 		"imageurl": imageurl,
// 	}
// 	body, _ := json.Marshal(params)
// 	var msgIds []string
// 	if resp, err := httplib.Post(localUrl()+"/sendImage").Header("Content-Type", "application/json").Body(body).Bytes(); err == nil {
// 		if data, err := jsonparser.GetString(resp, "data"); err == nil {
// 			json.Unmarshal([]byte(data), &msgIds)
// 			return msgIds, nil
// 		}
// 	}
// 	return nil, errors.New("回复失败")
// }

// /*
// * @description: 回复语音
// * @param {string} voiceurl 语音链接
// * @return {[]string} 消息ID
//  */
// func (s *Sender) ReplyVoice(voiceurl string) ([]string, error) {
// 	params := map[string]interface{}{
// 		"senderid": s.SenderID,
// 		"voiceurl": voiceurl,
// 	}
// 	body, _ := json.Marshal(params)
// 	var msgIds []string
// 	if resp, err := httplib.Post(localUrl()+"/sendVoice").Header("Content-Type", "application/json").Body(body).Bytes(); err == nil {
// 		if data, err := jsonparser.GetString(resp, "data"); err == nil {
// 			json.Unmarshal([]byte(data), &msgIds)
// 			return msgIds, nil
// 		}
// 	}
// 	return nil, errors.New("回复失败")
// }

// /*
// * @description: 回复视频
// * @param {string} videourl 视频链接
// * @return {[]string} 消息ID
//  */
// func (s *Sender) ReplyVideo(videourl string) ([]string, error) {
// 	params := map[string]interface{}{
// 		"senderid": s.SenderID,
// 		"videourl": videourl,
// 	}
// 	body, _ := json.Marshal(params)
// 	var msgIds []string
// 	if resp, err := httplib.Post(localUrl()+"/sendVideo").Header("Content-Type", "application/json").Body(body).Bytes(); err == nil {
// 		if data, err := jsonparser.GetString(resp, "data"); err == nil {
// 			json.Unmarshal([]byte(data), &msgIds)
// 			return msgIds, nil
// 		}
// 		return msgIds, nil
// 	}
// 	return nil, errors.New("回复失败")
// }

// /*
// * @description: 等待用户输入
// * @param {string} timeout 超时，单位：毫秒
// * @return {string} 用户输入的消息
//  */
// func (s *Sender) Listen(timeout int) string {
// 	params := map[string]interface{}{
// 		"senderid": s.SenderID,
// 		"timeout":  timeout,
// 	}
// 	body, _ := json.Marshal(params)
// 	resp, _ := httplib.Post(localUrl()+"/listen").Header("Content-Type", "application/json").Body(body).Bytes()
// 	rlt, _ := jsonparser.GetString(resp, "data")
// 	return rlt
// }

// /*
// * @description: 等待用户支付
// * @param {string} timeout 超时，单位：毫秒
// * @return {string} 用户支付信息json字符串
//  */
// func (s *Sender) WaitPay(exitCode string, timeout int) string {
// 	params := map[string]interface{}{
// 		"senderid": s.SenderID,
// 		"exitCode": exitCode,
// 		"timeout":  timeout,
// 	}
// 	body, _ := json.Marshal(params)
// 	resp, _ := httplib.Post(localUrl()+"/waitPay").Header("Content-Type", "application/json").Body(body).Bytes()
// 	rlt, _ := jsonparser.GetString(resp, "data")
// 	return rlt
// }

// /*
// * @description: 判断当前是否处于等待用户支付状态
//  */
// func (s *Sender) AtWaitPay() bool {
// 	params := map[string]interface{}{
// 		"senderid": s.SenderID,
// 	}
// 	body, _ := json.Marshal(params)
// 	resp, _ := httplib.Post(localUrl()+"/atWaitPay").Header("Content-Type", "application/json").Body(body).Bytes()
// 	rlt, _ := jsonparser.GetBoolean(resp, "data")
// 	return rlt
// }

// func (s *Sender) GroupInviteIn(friend, group string) error {
// 	params := map[string]interface{}{
// 		"senderid": s.SenderID,
// 		"friend":   friend,
// 		"group":    group,
// 	}
// 	body, _ := json.Marshal(params)
// 	if _, err := httplib.Post(localUrl()+"/groupInviteIn").Header("Content-Type", "application/json").Body(body).Bytes(); err != nil {
// 		return err
// 	} else {
// 		return nil
// 	}
// }

// func (s *Sender) GroupKick(userid string) error {
// 	params := map[string]interface{}{
// 		"senderid": s.SenderID,
// 		"userid":   userid,
// 	}
// 	body, _ := json.Marshal(params)
// 	if _, err := httplib.Post(localUrl()+"/groupKick").Header("Content-Type", "application/json").Body(body).Bytes(); err != nil {
// 		return err
// 	} else {
// 		return nil
// 	}
// }

// func (s *Sender) GroupBan(userid string, timeout int) error {
// 	params := map[string]interface{}{
// 		"senderid": s.SenderID,
// 		"userid":   userid,
// 		"timeout":  timeout,
// 	}
// 	body, _ := json.Marshal(params)
// 	if _, err := httplib.Post(localUrl()+"/groupBan").Header("Content-Type", "application/json").Body(body).Bytes(); err != nil {
// 		return err
// 	} else {
// 		return nil
// 	}
// }

// func (s *Sender) GroupUnban(userid string) error {
// 	params := map[string]interface{}{
// 		"senderid": s.SenderID,
// 		"userid":   userid,
// 	}
// 	body, _ := json.Marshal(params)
// 	if _, err := httplib.Post(localUrl()+"/groupUnban").Header("Content-Type", "application/json").Body(body).Bytes(); err != nil {
// 		return err
// 	} else {
// 		return nil
// 	}
// }

// func (s *Sender) GroupWholeBan(userid string) error {
// 	params := map[string]interface{}{
// 		"senderid": s.SenderID,
// 		"userid":   userid,
// 	}
// 	body, _ := json.Marshal(params)
// 	if _, err := httplib.Post(localUrl()+"/groupWholeBan").Header("Content-Type", "application/json").Body(body).Bytes(); err != nil {
// 		return err
// 	} else {
// 		return nil
// 	}
// }

// func (s *Sender) GroupWholeUnban(userid string) error {
// 	params := map[string]interface{}{
// 		"senderid": s.SenderID,
// 		"userid":   userid,
// 	}
// 	body, _ := json.Marshal(params)
// 	if _, err := httplib.Post(localUrl()+"/groupWholeUnban").Header("Content-Type", "application/json").Body(body).Bytes(); err != nil {
// 		return err
// 	} else {
// 		return nil
// 	}
// }

// func (s *Sender) GroupNoticeSend(notice string) error {
// 	params := map[string]interface{}{
// 		"senderid": s.SenderID,
// 		"notice":   notice,
// 	}
// 	body, _ := json.Marshal(params)
// 	if _, err := httplib.Post(localUrl()+"/groupNoticeSend").Header("Content-Type", "application/json").Body(body).Bytes(); err != nil {
// 		return err
// 	} else {
// 		return nil
// 	}
// }

// func (s *Sender) GetPluginName() string {
// 	params := map[string]interface{}{
// 		"senderid": s.SenderID,
// 	}
// 	body, _ := json.Marshal(params)
// 	resp, _ := httplib.Post(localUrl()+"/getPluginName").Header("Content-Type", "application/json").Body(body).Bytes()
// 	rlt, _ := jsonparser.GetString(resp, "data")
// 	return rlt
// }

// func (s *Sender) GetPluginVersion() string {
// 	params := map[string]interface{}{
// 		"senderid": s.SenderID,
// 	}
// 	body, _ := json.Marshal(params)
// 	resp, _ := httplib.Post(localUrl()+"/getPluginVersion").Header("Content-Type", "application/json").Body(body).Bytes()
// 	rlt, _ := jsonparser.GetString(resp, "data")
// 	return rlt
// }
