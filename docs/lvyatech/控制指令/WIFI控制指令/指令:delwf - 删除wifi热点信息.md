###“指令:delwf - 删除可连入的wifi热点信息”使用说明
####指令的作用
　　使用 delwf 指令，可以将开发板中可以连入的WIFI热点信息删除掉。
　　您可以为开发板指定多个WIFI热点信息，开发板会根据附近的WIFI热点清单，自动选择信号最佳的热点进行连接。
　　开发板中可以存储多组WIFI热点信息，数量一般没有上限。
　　**注意，WIFI热点必须是2.4G制式。**
  
####指令的格式（示例）
```
http://192.168.7.170:38585/ctrl?token=3f4bffa77257d243875d0a5a80635934&amp;cmd=delwf&amp;p1=wifi热点名
```
####指令的格式（TCP方式示例）
```
{&quot;cmd&quot;:&quot;delwf&quot;, &quot;p1&quot;:&quot;wifi热点名&quot;, &quot;tid&quot;:&quot;1234&quot;}\x11\x12
```
####指令参数说明
 | 参数名  | 参数值（示例）  |参数类型|说明|
| ------------ |:------------ |-----|--|
|token |3f4bffa77257d243875d0a5a80635934 |字符型|管理员Token|
|cmd  | delwf |字符型|控制指令名称|
|p1 |wifi热点名 |字符型|可连入的WIFI热点名|
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



