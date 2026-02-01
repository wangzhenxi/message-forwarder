###“指令:telanswer - 控制卡槽接听来电”使用说明
####指令的作用
　　使用 telanswer 指令，可以控制设备的某个卡槽，接听正在响铃中的来电。
####指令的格式（示例）
```
http://192.168.7.170:38585/ctrl?token=3f4bffa77257d243875d0a5a80635934&amp;cmd=telanswer&amp;p1=1&amp;p2=55&amp;p3=拨通后播放的TTS语音内容&amp;p4=2&amp;p5=1&amp;p6=1
```
####指令的格式（TCP方式示例）
```
{&quot;cmd&quot;:&quot;telanswer&quot;, &quot;p1&quot;:1, &quot;p2&quot;:55, &quot;p3&quot;:&quot;拨通后播放的TTS语音内容&quot;, &quot;p4&quot;:2, &quot;p5&quot;:1, &quot;p6&quot;:1, &quot;tid&quot;:&quot;1234&quot;}\x11\x12
```
####指令参数说明
 | 参数名  | 参数值（示例）  |参数类型|说明|
| ------------ |:------------ |-----|--|
|token |3f4bffa77257d243875d0a5a80635934 |字符型|管理员Token|
|cmd  | telanswer |字符型|控制指令名称|
|p1 |1 |数值型|接听来电的卡槽号。（1：卡一；2：卡二）|
|p2 | 55 | 数值型 | 通话总时长（秒）。到达后，主动挂断电话。默认值：175秒|
|p3 | 拨通后播放的TTS语音内容 | 字符型 | 电话接通后向对方播放的TTS语音内容 |
|p4 | 2 | 数值型 | TTS语音播放的次数。（标识TTS共播放几轮）|
|p5 | 1 | 数值型 | 暂停时间。一轮TTS播放完成后，暂停多少秒，再开始下一轮播放|
|p6 | 1 | 数值型 | TTS全部播放完成后的动作。（0：无操作；1：挂断电话）
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

