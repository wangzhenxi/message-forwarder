###“指令:pingsec - 修改ping间隔秒数”使用说明
####指令的作用
　　使用 pingsec 指令，可以修改PING消息（推送消息998）的周期间隔秒数。此值修改后，需要重启开发板后方能生效。
　　在HTTP接口方式中，此指令可以在WEB控制台上禁止推送。
　　在TCP接口方式中，为了维持网络连接，此指令强制必须推送。
####指令的格式（示例）
```
http://192.168.7.170:38585/ctrl?token=3f4bffa77257d243875d0a5a80635934&amp;cmd=pingsec&amp;p1=60
```
####指令的格式（TCP方式示例）
```
{&quot;cmd&quot;:&quot;pingsec&quot;, &quot;p1&quot;:60, &quot;tid&quot;:&quot;1234&quot;}\x11\x12
```
####指令参数说明
 | 参数名  | 参数值（示例）  |参数类型|说明|
| ------------ |:------------ |-----|--|
|token |3f4bffa77257d243875d0a5a80635934 |字符型|管理员Token|
|cmd  | pingsec |字符型|控制指令名称|
|p1 |60 |数值型|间隔秒数，最小值10。|
|tid (可选)  | 任意值 |字符型|仅TCP接口方式可用。如省略，则指令执行后，不反馈指令执行结果。|
####指令反馈结果
成功时返回：
```
{
  &quot;code&quot;: 0
}
```

失败时返回：
```
{
  &quot;code&quot;: 101,
  &quot;msg&quot;: &quot;Invalid arguments.&quot;
}
```

####指令反馈结果说明
无


