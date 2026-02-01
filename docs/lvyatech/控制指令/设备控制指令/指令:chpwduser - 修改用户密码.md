###“指令:chpwduser - 修改用户密码”使用说明
####指令的作用
　　使用chpwduser指令，可以修改用户密码。
####指令的格式（HTTP方式示例）
```
http://192.168.7.170:38585/ctrl?token=3f4bffa77257d243875d0a5a80635934&amp;cmd=chpwduser&amp;p1=000000
```
####指令的格式（TCP方式示例）
```
{&quot;cmd&quot;:&quot;chpwduser&quot;, &quot;p1&quot;:&quot;000000&quot;, &quot;tid&quot;:&quot;1234&quot;}\x11\x12
```
####指令参数说明
 | 参数名  | 参数值（示例）  |参数类型|说明|
| ------------ |:------------ |-----|--|
|token |3f4bffa77257d243875d0a5a80635934 |字符型|管理员Token|
|cmd  | chpwduser |字符型|控制指令名称|
|p1 |000000 |字符型|新用户密码（不能少于4个字符）|
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

