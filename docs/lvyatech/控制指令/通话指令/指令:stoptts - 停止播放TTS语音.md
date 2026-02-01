###“指令:stoptts - 通话中停止正在播放的TTS语音”使用说明
####指令的作用
　　使用 stoptts 指令，当某个卡槽处于通话中的状态时，可以通过本指令停止正在播放的TTS语音内容。
####指令的格式（示例）
```
http://192.168.7.170:38585/ctrl?token=3f4bffa77257d243875d0a5a80635934&amp;cmd=stoptts&amp;p1=1&amp;p2=0
```
####指令的格式（TCP方式示例）
```
{&quot;cmd&quot;:&quot;stoptts&quot;, &quot;p1&quot;:1, &quot;p2&quot;:0, &quot;tid&quot;:&quot;1234&quot;}\x11\x12
```
####指令参数说明
 | 参数名  | 参数值（示例）  |参数类型|说明|
| ------------ |:------------ |-----|--|
|token |3f4bffa77257d243875d0a5a80635934 |字符型|管理员Token|
|cmd  | stoptts |字符型|控制指令名称|
|p1 | 1 |数值型|拨号的卡槽号。（1：卡一；2：卡二）|
|p2 | 0 | 数值型 | TTS停止播放后的动作。（0：无操作；1：挂断电话）
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


