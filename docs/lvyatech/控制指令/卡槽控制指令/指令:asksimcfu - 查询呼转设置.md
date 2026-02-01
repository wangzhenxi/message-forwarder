###“指令:asksimcfu - 查询SIM卡当前的呼叫转移设置”使用说明
####指令的作用
　　使用 asksimcfu 指令，可以查询开发板上，指定卡槽SIM卡的呼叫转移设置。
  
####示例：查询卡槽1 SIM卡的呼叫转移设置，http指令的格式如下：
```
http://192.168.7.170:38585/ctrl?token=3f4bffa77257d243875d0a5a80635934&amp;cmd=asksimcfu&amp;p1=1
```
####TCP指令示例如下：
```
{&quot;cmd&quot;:&quot;asksimcfu&quot;, &quot;p1&quot;:&quot;1&quot;, &quot;tid&quot;:&quot;1234&quot;}\x11\x12
```
_

####指令参数说明
 | 参数名  | 参数值（示例）  |参数类型|说明|
| ------------ |:------------ |-----|--|
|token |3f4bffa77257d243875d0a5a80635934 |字符型|管理员Token|
|cmd  | asksimcfu |字符型|控制指令名称|
|p1 |1 |数值型|卡槽号。1表示卡槽1；2表示卡槽2|
|tid (可选)  | 任意值 |字符型|仅TCP接口方式可用。如省略，则指令执行后，不反馈指令执行结果。|
####指令反馈结果
成功时返回：
```
{
  &quot;code&quot;:0,
  &quot;val&quot;:&quot;Querying the Call Forwarding Unconditional of slot 1&quot;,
  &quot;type&quot;:999,
  &quot;netCh&quot;:0,
  &quot;tid&quot;:&quot;1234&quot;
}
```
查询过程可能需要几秒~几十秒，查询完成后，通过703事件上报：
```
{
  &quot;devId&quot;:&quot;f8efb2835b0x&quot;,
  &quot;slot&quot;:1,
  &quot;type&quot;:703,
  &quot;netCh&quot;:0,
  &quot;imsi&quot;:&quot;460115191234567&quot;,
  &quot;iccId&quot;:&quot;89860321045721234567&quot;,
  &quot;phNum&quot;:&quot;053289265468&quot;,
  &quot;charset&quot;:&quot;utf8&quot;
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

