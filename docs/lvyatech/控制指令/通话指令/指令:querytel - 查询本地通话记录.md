###“命令：querytel - 查询本地通话记录”使用说明
####命令的作用
　　开发板本身可以滚动存储最近的50条通话记录。通过 querytel 命令，可以查询开发板本地存储的最近50条通话记录。
  
####命令的格式（示例）
```
http://192.168.7.170/ctrl?token=3f4bffa77257d243875d0a5a80635934&amp;cmd=querytel&amp;p1=1&amp;p2=10&amp;p3=0
```
####命令的格式（TCP方式示例）
```
{&quot;cmd&quot;:&quot;querytel&quot;, &quot;p1&quot;:1, &quot;p2&quot;:10, &quot;p3&quot;:0}\x11\x12
```
####命令参数说明
 | 参数名  | 参数值（示例）  |参数类型|说明|
| ------------ |:------------ |-----|--|
|token |3f4bffa77257d243875d0a5a80635934 |字符型|管理员Token|
|cmd  | querysms |字符型|控制命令名称|
|p1 |1 |数值型|从第几条短信开始查询（offset）|
|p2 |10 |数值型|共查询多少条（rows On Page）|
|p3 |10 |数值型|查询的通话类型。（0：所有；1：仅来电；2：仅外呼电话；3：仅漏接来电）|
|p4 |132 |字符型|限制查询的通话号码关键字（省略查所有）|
####命令反馈结果
成功时返回：
```json
{
  &quot;subType&quot;: 31,
  &quot;code&quot;: 0,
  &quot;offset&quot;: &quot;1&quot;,
  &quot;limit&quot;: &quot;3&quot;,
  &quot;callType&quot;: 0,
  &quot;qkey&quot;: &quot;&quot;,
  &quot;results&quot;: [
    {
      &quot;slot&quot;: 1,
      &quot;dir&quot;: 1,
      &quot;phNum&quot;: &quot;053256894747&quot;,
      &quot;telStartTs&quot;: 1751421911,
      &quot;telEndTs&quot;: 1751421941,
      &quot;conn&quot;: 1
    },
    {
      &quot;slot&quot;: 2,
      &quot;dir&quot;: 0,
      &quot;phNum&quot;: &quot;13855668899&quot;,
      &quot;telStartTs&quot;: 1751267248,
      &quot;telEndTs&quot;: 1751267251,
      &quot;conn&quot;: 0
    },
    {
      &quot;slot&quot;: 2,
      &quot;dir&quot;: 1,
      &quot;phNum&quot;: &quot;8613316582441&quot;,
      &quot;telStartTs&quot;: 1751266780,
      &quot;telEndTs&quot;: 1751266787,
      &quot;conn&quot;: 0
    },
    {
      &quot;slot&quot;: 1,
      &quot;dir&quot;: 0,
      &quot;phNum&quot;: &quot;anonymous&quot;,
      &quot;telStartTs&quot;: 1751017174,
      &quot;telEndTs&quot;: 1751017202,
      &quot;conn&quot;: 0
    }
  ],
  &quot;devId&quot;: &quot;e51e9881265a3c8&quot;,
  &quot;type&quot;: 402,
  &quot;netCh&quot;: 0,
  &quot;msgTs&quot;: 1751461200
}
```

失败时返回：
```json
{
  &quot;code&quot;: 101,
  &quot;msg&quot;: &quot;Invalid arguments.&quot;
}
```

####命令反馈结果说明
　　1）查询的通话记录，保存在results字段（集合）中。
  
　　2）p1参数指定从通话记录库的第几条开始查询（最值是1）， p2参数指定共查询多少条。
　　比如：当您需要分页查询，每页5条通话记录。查询第1页时，需要发送参数：
  &lt;center&gt;```p1=1(从第1条开始查询)；p2=5(共查询5条) ```&lt;/center&gt;
　　查询第2页时，需要发送参数：
    &lt;center&gt;```p1=6(从第1条开始查询)；p2=5(共查询5条) ```&lt;/center&gt;
　　依次类推。
  
　　3）当results字段中返回的记录数大于p2指定的查询条数时，表示后面还有更多记录可以查询。
　　比如：指定参数：p1=1, p2=5。返回的查询结果中results的记录数是6，表示本页查询完成后，后面还有更多的通话记录，可以继续查询。
　　同样的，如果指定参数：p1=1, p2=5。返回的查询结果中results的记录数是5 或 小于5。则表示本页面已经是最后一页了。后面没有更多通话记录了。
  
　　4）本地通话记录库是按通话时间“降序保存”的，即最后进行的通话，总是出现在通话记录库的第1页的第1条。如果您需要查询通话记录库中最近的5条记录，则指定的参数总是：
  &lt;center&gt;```p1=1(从第1条开始查询)；p2=5(共查询5条) ```&lt;/center&gt;
　　这样的话，querytel命令总是返回开发板最近记录的5条通话记录。
  
　　5）返回记录的结果的各字段意义解释：
```json
  &quot;results&quot;: [
    {
      &quot;slot&quot;: 1,	//卡槽号。1表示卡槽一
      &quot;dir&quot;: 1,		//通话方向。 0表示呼入通话；1表示呼出通话
      &quot;phNum&quot;: &quot;053256894747&quot;,		//通话号码
      &quot;telStartTs&quot;: 1751421911,		//通话开始时间戳
      &quot;telEndTs&quot;: 1751421941,		//通话结束时间戳
      &quot;conn&quot;: 1		//电话是否接通。0：未接通；1：已接通
    }]
```





