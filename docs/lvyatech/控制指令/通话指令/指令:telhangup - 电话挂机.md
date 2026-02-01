###“指令:telhangup - 控制卡槽挂断当前通话”使用说明
####指令的作用
　　使用 telhangup 指令，可以控制设备的某个卡槽，立即挂断当前的通话。
####指令的格式（示例）
```
http://192.168.7.170:38585/ctrl?token=3f4bffa77257d243875d0a5a80635934&amp;cmd=telhangup&amp;p1=1
```
####指令的格式（TCP方式示例）
```
{&quot;cmd&quot;:&quot;telhangup&quot;, &quot;p1&quot;:1, &quot;tid&quot;:&quot;1234&quot;}\x11\x12
```
####指令参数说明
 | 参数名  | 参数值（示例）  |参数类型|说明|
| ------------ |:------------ |-----|--|
|token |3f4bffa77257d243875d0a5a80635934 |字符型|管理员Token|
|cmd  | telhangup |字符型|控制指令名称|
|p1 |1 |数值型|执行挂机的卡槽号。（1：卡一；2：卡二）|
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

