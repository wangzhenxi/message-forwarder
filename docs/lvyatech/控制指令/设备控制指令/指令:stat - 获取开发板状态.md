###“指令:stat  - 获取开发板当前状态”使用说明
####指令的作用
　　使用stat指令，可以获取到开发板的当前所有的状态信息。
####指令的格式（示例）
```
http://192.168.7.170:38585/ctrl?token=3f4bffa77257d243875d0a5a80635934&amp;cmd=stat
```
####指令的格式（TCP方式示例）
```
{&quot;cmd&quot;:&quot;stat&quot;, &quot;tid&quot;:&quot;1234&quot;}\x11\x12
```
####指令参数说明
 | 参数名  | 参数值（示例）  |参数类型|说明|
| ------------ |:------------ |-----|--|
|token |3f4bffa77257d243875d0a5a80635934 |字符型|管理员Token|
|cmd  | stat |字符型|控制指令名称|
|tid   | 任意值 |字符型|仅TCP接口方式可用。可为任意值，但不可省略|
####指令反馈结果
成功时返回：
 ```
 {
  &quot;devId&quot;: &quot;498060912345&quot;,
  &quot;hwVer&quot;: &quot;Y57v671&quot;,
  &quot;dailyRst&quot;: 4,
  &quot;dailyOTA&quot;: 3,
  &quot;pingSec&quot;: 110,
  &quot;netCh&quot;: 0,
  &quot;wifi&quot;: {
    &quot;ssid&quot;: &quot;mywifi&quot;,
    &quot;ip&quot;: &quot;192.168.7.170&quot;,
    &quot;dbm&quot;: 24
  },
  &quot;slot&quot;: {
    &quot;netOrder&quot;:[1,2],
    &quot;slot1_sta&quot;: &quot;ERR&quot;,
    &quot;slot2_sta&quot;: &quot;POWON&quot;,
    &quot;slot2_ati&quot;: &quot;EC600NCNLAR03A11M08&quot;,
    &quot;sim2_op&quot;: &quot;T&quot;,
    &quot;sim2_dbm&quot;: &quot;78&quot;,
    &quot;sim2_iccId&quot;: &quot;89860321745322288888&quot;,
    &quot;sim2_imsi&quot;: &quot;46007337111234&quot;,
    &quot;sim2_msIsdn&quot;: &quot;+8613206411822&quot;,
    &quot;sim2_sta&quot;: &quot;OK&quot;
  }
  &quot;devTime&quot;: &quot;220420184724&quot;,
  &quot;type&quot;: 999,
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
| 参数名  | 参数值（示例）  |参数类型|说明|
| ------------ |------------ |-----|--|
|devId |498060912345 |字符型|开发板的唯一ID|
|hwVer| Y57v671 |字符型|开发板的固件版本号|
|dailyRst  | 4 |数值型|开发板每日定时自动重启的时间。默认值4，有效值0~23。|
|dailyOTA  | 3 |数值型|开发板每日定时自动OTA升级的时间。默认值3，有效值0~23。|
|pingSec  | 110 |数值型|向接口循环推送消息998的周期间隔（秒）。默认值110，最小值10。|
|netCh  | 0 |数值型|本消息由开发板的哪个网络通道推送。0:WIFI; 1:SIM1; 2:SIM2|
|netOrder  | [1,2] |数值数组型|TCP接口方式中，如未连入WIFI，则根据本参数指定的卡槽顺序，尝试使用手机卡网络。|
|wifi -&gt; ssid  | mywifi |字符型|开发板已经连入的WIFI热点名称。|
|wifi -&gt; ip  | 192.168.7.170 |字符型|开发板当前的IP地址。|
|wifi -&gt; dbm  | 24 |数值型|开发板当前连入WIFI热点的信号强度（百分比）。|
|slot -&gt; slot1_sta  | ERR |字符型|卡槽1的当前状态。参见下方的参数说明。|
|slot -&gt; slot2_sta  | POWON |字符型|卡槽2的当前状态。|
|slot -&gt; slot2_ati  | EC600NCNLAR03A11M08 |字符型|卡槽2通信模组的固件版本号。|
|slot -&gt; sim2_op  | T|字符型|卡槽2中SIM卡，所属的运营商。|
|slot -&gt; sim2_dbm  | 78 |数值型|卡槽2中SIM卡的信号强度（百分比）。|
|slot -&gt; sim2_iccId  | 89860321745322288888 |字符型|卡槽2中SIM卡的ICCID。|
|slot -&gt; sim2_imsi  | 46007337111234 |字符型|卡槽2中SIM卡的IMSI。|
|slot -&gt; sim2_msIsdn  | +8613206411822 |字符型|卡槽2中SIM卡的电话号码。|
|slot -&gt; sim2_sta  | OK |字符型|卡槽2中SIM卡的当前状态。参见下方的参数说明。|
|devTime|220420184724|数值型|开发板的当前时间（年年月月日日时时分分秒秒）
|type|999|数值型|消息分类（应答类消息）

####关于slot[1|2]_sta参数的说明
| 参数值  |说明|
| -------- |---------- |
|ERR |卡槽识别错误。可能的原因：1、通信模组未插入；2、通信模组损坏；3、通信模组未获支持。|
|NOSIM |卡槽正常开机，但卡槽中没有插入有效的SIM卡。|
|POWON |卡槽正常开机，SIM卡正常可用。|
|POWOFF |卡槽没有开机。|

####关于sim[1|2]_sta参数的说明
| 参数值  |说明|
| -------- |---------- |
|OK |SIM卡工作正常。|
|PUK |SIM卡上有PUK密码。|
|NS |SIM卡无服务。|
|LT |SIM卡已被限制服务。|

####关于sim[1|2]_op参数的说明
| 参数值  |说明|
| -------- |---------- |
|C |中国移动|
|U |中国联通|
|T |中国电信
|X |境外卡？|
|N |识别失败|



