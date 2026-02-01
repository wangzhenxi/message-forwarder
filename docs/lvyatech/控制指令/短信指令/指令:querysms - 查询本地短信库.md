###“命令：querysms - 查询本地短信库”使用说明
####命令的作用
　　开发板本身可以滚动存储最近的100条短信。通过 querysms 命令，可以查询开发板本地存储的最近100条短信记录。
  
####命令的格式（示例）
```
http://192.168.7.170/ctrl?token=3f4bffa77257d243875d0a5a80635934&amp;cmd=querysms&amp;p1=1&amp;p2=10
```
####命令的格式（TCP方式示例）
```
{&quot;cmd&quot;:&quot;querysms&quot;, &quot;p1&quot;:1, &quot;p2&quot;:10}\x11\x12
```
####命令参数说明
 | 参数名  | 参数值（示例）  |参数类型|说明|
| ------------ |:------------ |-----|--|
|token |3f4bffa77257d243875d0a5a80635934 |字符型|管理员Token|
|cmd  | querysms |字符型|控制命令名称|
|p1 |1 |数值型|从第几条短信开始查询（offset）|
|p2 |10 |数值型|共查询多少条（rows On Page）|
|p3 |话费余额 |字符型|限制查询的短信内容关键字（省略查所有）|
####命令反馈结果
成功时返回：
```
{
  &quot;subType&quot;: 30,
  &quot;code&quot;: 0,
  &quot;qkey&quot;: &quot;&quot;,
  &quot;offset&quot;: &quot;1&quot;,
  &quot;limit&quot;: &quot;10&quot;,
  &quot;results&quot;: [
    {
      &quot;slot&quot;: 1,
      &quot;dir&quot;: 0,
      &quot;phNum&quot;: &quot;10691021560051&quot;,
      &quot;smsBd&quot;: &quot;【火山引擎】尊敬的用户，…………&quot;,
      &quot;smsTs&quot;: 1751453195
    },
    {
      &quot;slot&quot;: 1,
      &quot;dir&quot;: 0,
      &quot;phNum&quot;: &quot;10691009096368&quot;,
      &quot;smsBd&quot;: &quot;【河北银行】您尾号7525的信用卡…………&quot;,
      &quot;smsTs&quot;: 1751428444
    },
    {
      &quot;slot&quot;: 1,
      &quot;dir&quot;: 0,
      &quot;phNum&quot;: &quot;95555&quot;,
      &quot;smsBd&quot;: &quot;【招商银行】张三于07月02日07:56向贵账户7524发起2121.00元的转账，请注意查收.&quot;,
      &quot;smsTs&quot;: 1751417021
    },
    {
      &quot;slot&quot;: 1,
      &quot;dir&quot;: 0,
      &quot;phNum&quot;: &quot;10680786600000009587&quot;,
      &quot;smsBd&quot;: &quot;【贝锐】您正在验证向日葵帐号的登录操作，验证码：502519。&quot;,
      &quot;smsTs&quot;: 1751360771
    },
    {
      &quot;slot&quot;: 1,
      &quot;dir&quot;: 0,
      &quot;phNum&quot;: &quot;106305792292&quot;,
      &quot;smsBd&quot;: &quot;【深度求索】验证码：517351，有效期 5 分钟，如非本人操作，请忽略。&quot;,
      &quot;smsTs&quot;: 1751359963
    }
  ],
  &quot;devId&quot;: &quot;e51e9881265a3c8&quot;,
  &quot;type&quot;: 402,
  &quot;netCh&quot;: 0,
  &quot;msgTs&quot;: 1751460187
}
```

失败时返回：
```
{
  &quot;code&quot;: 101,
  &quot;msg&quot;: &quot;Invalid arguments.&quot;
}
```

####命令反馈结果说明
　　1）查询的短信结果，保存在results字段（集合）中。
  
　　2）p1参数指定从短信库的第几条开始查询（最值是1）， p2参数指定共查询多少条。
　　比如：当您需要分页查询，每页5条短信记录。查询第1页时，需要发送参数：
  &lt;center&gt;```p1=1(从第1条开始查询)；p2=5(共查询5条) ```&lt;/center&gt;
　　查询第2页时，需要发送参数：
    &lt;center&gt;```p1=6(从第1条开始查询)；p2=5(共查询5条) ```&lt;/center&gt;
　　依次类推。
  
　　3）当results字段中返回的记录数大于p2指定的查询条数时，表示后面还有更多记录可以查询。
　　比如：指定参数：p1=1, p2=5。返回的查询结果中results的记录数是6，表示本页查询完成后，后面还有更多的短信记录，可以继续查询。
　　同样的，如果指定参数：p1=1, p2=5。返回的查询结果中results的记录数是5 或 小于5。则表示本页面已经是最后一页了。后面没有更多短信记录了。
  
　　4）本地短信库是按短信时间“降序保存”的，即最后收到的短信，总是出现在短信库的第1页的第1条。如果您需要查询短信库中最近的5条记录，则指定的参数总是：
  &lt;center&gt;```p1=1(从第1条开始查询)；p2=5(共查询5条) ```&lt;/center&gt;
　　这样的话，querysms命令总是返回开发板最近收到的5条短信记录。
  
　　5）返回记录的结果的各字段意义解释：
```json
  &quot;results&quot;: [
    {
      &quot;slot&quot;: 1,	//卡槽号。1表示卡槽一
      &quot;dir&quot;: 1,		//短信方向。 0表示收到的短信；1表示发出的短信
      &quot;phNum&quot;: &quot;053256894747&quot;,		//短信号码
      &quot;smsBd&quot;: &quot;【河北银行】您尾号7525的信用卡…………&quot;,
      &quot;smsTs&quot;: 1751428444		//短信时间戳
    }]
```


