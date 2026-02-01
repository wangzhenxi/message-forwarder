###“消息：100 - WIFI已联网” 使用说明

####消息的作用
100消息，是开发板向接口推送的第1个消息。表示开发板已经正确连入了WIFI网络。
－
####消息参数说明
 | 参数名  | 参数值（示例）  |参数类型|说明|
| ------------ |:------------ |-----|--|
|devId |498060912345 |字符型|开发板唯一ID|
|type |100|数值型|消息ID|
|ip  | 192.168.7.170 |字符型|开发板当前IP地址|
|ssid |mywifi |字符型（*注1）|开发板连入的WIFI名|
|dbm | 61  |数值型|开发板连入的WIFI信号强度|
|netCh  | 0 |数值型|本消息由开发板的哪个网络通道推送。0:WIFI; 1:SIM1; 2:SIM2|
**注1**：ssid字段默认进行了URL encode编码的，建议在读取出此字段时，先进行URL decode再使用。(主流的高级语言都有URL decode的公开库)
　
####消息内容（FORM)
FORM格式时，开发板自动模拟的HTML表单提交，将数据推送到您的接口。
模拟样式如下：
```
&lt;form&gt;
	&lt;input name=&quot;devId&quot; value=&quot;498060912345&quot;&gt;
	&lt;input name=&quot;type&quot; value=&quot;100&quot;&gt;
	&lt;input name=&quot;ip&quot; value=&quot;192.168.7.170&quot;&gt;
	&lt;input name=&quot;ssid&quot; value=&quot;mywifi&quot;&gt;
	&lt;input name=&quot;dbm&quot; value=&quot;61&quot;&gt;
	&lt;input name=&quot;netCh&quot; value=&quot;0&quot;&gt;
&lt;/form&gt;
```
　
####消息内容（JSON)
JSON格式时，开发板向您的接口推送的JSON样式如下：
 ``` 
{
  &quot;devId&quot;: &quot;498060912345&quot;,
  &quot;type&quot;: 100,
  &quot;ip&quot;: &quot;192.168.7.170&quot;,
  &quot;ssid&quot;: &quot;mywifi&quot;,
  &quot;dbm&quot;: 61,
  &quot;netCh&quot;: 0
} 
```
　
 ####请注意：
- 如果您的接口是HTTP方式，开发板向您的接口推送100消息时，您的HTTP接口可以不返回数据。但是，接口的WEB服务器返回HTTP CODE值必须为200，否则，开发板会自动尝试连接其它WIFI热点（如有），并重新推送100消息，直到HTTP CODE能够返回200。
- 如果您的接口是TCP方式，开发板向您的接口推送100消息时，您的接口 **必须** 返回以下格式的应答：
```
{&quot;cmd&quot;:&quot;now&quot;, &quot;p1&quot;:&quot;20220330184700&quot;, &quot;tid&quot;:&quot;1234&quot;}\x11\x12
```
即，返回14位当前时间做为应答。此应答必须在5秒内完成，否则将视为TCP链接建立失败。正常情况下，您的接口给出上述应答之后，开发板将再次回复一个“应答已收到”的消息给您的接口，格式如下：
```
{&quot;code&quot;:0, &quot;type&quot;:999, &quot;netCh&quot;:0, &quot;tid&quot;:&quot;1234&quot;}\x11\x12
```
至此，开发板与您的接口之间TCP网络建立成功。
