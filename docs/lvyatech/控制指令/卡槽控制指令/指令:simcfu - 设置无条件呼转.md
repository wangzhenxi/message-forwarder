###“指令:simcfu - 为SIM卡设置无条件呼叫转移”使用说明
####指令的作用
　　使用 simcfu 指令，可以为开发板上的某个卡槽中SIM卡，开通（或取消）无条件呼叫转移。

&gt; 注意：如果手机卡在插入到设备之前，已经开通了呼叫转移，在某些情况下，执行simcfu指令重新设置（或取消）呼叫转移时，设置可能不会成功。建议手机卡插入设备之前，先手动关闭手机卡呼叫转移功能。

&gt; Tips：在手机拨号界面拨打 ##21# 即可取消手机卡的无条件呼叫转移。
  
####示例1：为卡槽1中的SIM卡设置无条件呼叫转移至053289265468，http指令的格式如下：
```
http://192.168.7.170:38585/ctrl?token=3f4bffa77257d243875d0a5a80635934&amp;cmd=simcfu&amp;p1=1&amp;p2=053289265468
```
####TCP指令示例如下：
```
{&quot;cmd&quot;:&quot;simcfu&quot;, &quot;p1&quot;:&quot;1&quot;, &quot;p2&quot;:&quot;053289265468&quot;, &quot;tid&quot;:&quot;1234&quot;}\x11\x12
```

_
####示例2：为卡槽1中的SIM卡取消无条件呼叫转移，http指令的格式如下：
```
http://192.168.7.170:38585/ctrl?token=3f4bffa77257d243875d0a5a80635934&amp;cmd=simcfu&amp;p1=1
```
####TCP指令示例如下：
```
{&quot;cmd&quot;:&quot;simcfu&quot;, &quot;p1&quot;:&quot;1&quot;, &quot;tid&quot;:&quot;1234&quot;}\x11\x12
```

####指令参数说明
 | 参数名  | 参数值（示例）  |参数类型|说明|
| ------------ |:------------ |-----|--|
|token |3f4bffa77257d243875d0a5a80635934 |字符型|管理员Token|
|cmd  | simcfu |字符型|控制指令名称|
|p1 |1 |数值型|卡槽号。1表示卡槽1；2表示卡槽2|
|p2 |1 |字符型|无条件呼叫转移的目标号码。此字段为空或不给出，表示取消无条件呼叫转移|
|tid (可选)  | 任意值 |字符型|仅TCP接口方式可用。如省略，则指令执行后，不反馈指令执行结果。|
####指令反馈结果
成功时返回：
```
{
  &quot;code&quot;: 0
}
```
为SIM卡设置无条件呼转可能需要几秒~几十秒的时间，如果设置**成功**上报701事件：
```
{
  &quot;devId&quot;:&quot;f8efb2835b0x&quot;,
  &quot;slot&quot;:1,
  &quot;type&quot;:701,
  &quot;netCh&quot;:0,
  &quot;imsi&quot;:&quot;460115191234567&quot;,
  &quot;iccId&quot;:&quot;8986032104571234567&quot;,
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
为SIM卡设置无条件呼转可能需要几秒~几十秒的时间，如果设置**失败**上报702事件：
```
{
  &quot;devId&quot;:&quot;f8efb2835b0x&quot;,
  &quot;slot&quot;:1,
  &quot;type&quot;:702,
  &quot;netCh&quot;:0,
  &quot;imsi&quot;:&quot;460115191234567&quot;,
  &quot;iccId&quot;:&quot;8986032104571234567&quot;,
  &quot;phNum&quot;:&quot;053289265468&quot;,
  &quot;reason&quot;:&quot;ERROR:0&quot;,
  &quot;charset&quot;:&quot;utf8&quot;
}
```

####指令反馈结果说明
无
