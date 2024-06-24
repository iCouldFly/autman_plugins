//[author: jusbe]
//[title: 超级time]
//[language: golang]
//[class: 工具类]
//[price: 2] 优先级，数字越大表示优先级越高
//[service: jusbe] 售后联系方式
//[disable: false] 禁用开关，true表示禁用，false表示可用
//[admin: false] 是否为管理员指令
//[rule: ^time$] 匹配规则，多个规则时向下依次写多个
//[priority: 1] 优先级，数字越大表示优先级越高
//[version: 1.0.0]版本号
//[public: true] 是否发布？值为true或false，不设置则上传aut云时会自动设置为true，false时上传后不显示在市场中，但是搜索能搜索到，方便开发者测试
//[price: 999] 上架价格
//[description: 超超超超级time<br>首发：20240413<br><img src="https://bbs.autman.cn/assets/files/2024-06-19/1718766252-660622-time.jpg" alt="超级time" />] 使用方法尽量写具体

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
