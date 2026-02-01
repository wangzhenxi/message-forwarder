<template>
  <div class="control-command">
    <a-typography-title :level="4">控制指令</a-typography-title>
    <a-typography-paragraph type="secondary">
      向开发板下发控制指令（代理到设备 /ctrl 接口）。设备地址与 token 由服务端配置文件
      <a-typography-text code>data/config.json</a-typography-text>
      或环境变量传入。
    </a-typography-paragraph>
    <a-card>
      <a-form layout="vertical" :style="{ maxWidth: 520 }">
        <a-form-item label="指令 cmd" required>
          <a-select
            v-model:value="form.cmd"
            placeholder="请选择"
            size="large"
            show-search
            :filter-option="filterOption"
            @change="form.params = {}"
          >
            <a-select-option value="">请选择</a-select-option>
            <a-select-opt-group label="设备状态">
              <a-select-option value="stat">stat - 获取开发板状态</a-select-option>
              <a-select-option value="restart">restart - 重启开发板</a-select-option>
            </a-select-opt-group>
            <a-select-opt-group label="短信 / 通话">
              <a-select-option value="sendsms">sendsms - 外发短信</a-select-option>
              <a-select-option value="querysms">querysms - 查询本地短信库</a-select-option>
              <a-select-option value="teldial">teldial - 电话拨号</a-select-option>
              <a-select-option value="telanswer">telanswer - 接听来电</a-select-option>
              <a-select-option value="telhangup">telhangup - 电话挂机</a-select-option>
              <a-select-option value="teltts">teltts - 播放 TTS 语音</a-select-option>
              <a-select-option value="stoptts">stoptts - 停止 TTS 播放</a-select-option>
              <a-select-option value="telkeypress">telkeypress - 本地电话按键</a-select-option>
              <a-select-option value="querytel">querytel - 查询本地通话记录</a-select-option>
            </a-select-opt-group>
            <a-select-opt-group label="WIFI">
              <a-select-option value="wf">wf - 打开/关闭 WIFI</a-select-option>
              <a-select-option value="addwf">addwf - 增加 WIFI 热点</a-select-option>
              <a-select-option value="delwf">delwf - 删除 WIFI 热点</a-select-option>
            </a-select-opt-group>
            <a-select-opt-group label="设备 / 时间">
              <a-select-option value="now">now - 设置开发板时间</a-select-option>
              <a-select-option value="dailyrst">dailyrst - 设置每日重启时间</a-select-option>
              <a-select-option value="pingsec">pingsec - 修改 PING 间隔</a-select-option>
              <a-select-option value="chpwduser">chpwduser - 修改用户密码</a-select-option>
            </a-select-opt-group>
            <a-select-opt-group label="卡槽">
              <a-select-option value="slotrst">slotrst - 指定卡槽重启</a-select-option>
              <a-select-option value="slotoff">slotoff - 指定卡槽关机</a-select-option>
              <a-select-option value="simcfu">simcfu - 设置无条件呼转</a-select-option>
              <a-select-option value="asksimcfu">asksimcfu - 查询呼转设置</a-select-option>
            </a-select-opt-group>
            <a-select-opt-group label="OTA">
              <a-select-option value="dailyota">dailyota - 设置每日 OTA 升级时间</a-select-option>
              <a-select-option value="otanow">otanow - 立即执行 OTA 升级</a-select-option>
            </a-select-opt-group>
            <a-select-option value="other">其它（手动填写 cmd）</a-select-option>
          </a-select>
          <a-input
            v-if="form.cmd === 'other'"
            v-model:value="form.cmdOther"
            placeholder="cmd 值"
            style="margin-top: 8px"
          />
        </a-form-item>

        <template v-if="currentParams.length > 0">
          <a-form-item
            v-for="param in currentParams"
            :key="param.key"
            :label="param.label"
            :required="param.required"
          >
            <a-input
              v-model:value="form.params[param.key]"
              :placeholder="param.placeholder"
              allow-clear
            />
            <a-typography-text v-if="param.hint" type="secondary" style="font-size: 12px; display: block; margin-top: 4px">
              {{ param.hint }}
            </a-typography-text>
          </a-form-item>
        </template>

        <a-form-item v-if="form.cmd === 'other'" label="附加参数（可选）">
          <a-textarea
            v-model:value="form.extraParams"
            placeholder="每行一个：参数名=值&#10;例：p1=1&#10;p2=10086"
            :rows="3"
          />
        </a-form-item>

        <a-form-item>
          <a-button type="primary" :loading="sending" @click="send">发送指令</a-button>
        </a-form-item>

        <a-alert
          v-if="result !== null"
          :message="resultOk ? '响应' : '错误'"
          :type="resultOk ? 'success' : 'error'"
          show-icon
        >
          <template #description>
            <pre class="result-pre">{{ resultText }}</pre>
          </template>
        </a-alert>
      </a-form>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { sendControl, type ControlPayload } from '@/api/lvyatech';

interface ParamDef {
  key: string;
  label: string;
  placeholder: string;
  required?: boolean;
  type?: 'string' | 'number';
  hint?: string;
}

const CMD_PARAMS: Record<string, ParamDef[]> = {
  sendsms: [
    { key: 'p1', label: '卡槽号', placeholder: '1 或 2', type: 'number', required: true },
    { key: 'p2', label: '短信号码', placeholder: '如 10001', required: true },
    { key: 'p3', label: '短信内容', placeholder: '短信正文', required: true },
    { key: 'tid', label: '唯一标识 tid', placeholder: '用于接收 501 报告', required: true },
  ],
  querysms: [
    { key: 'p1', label: '起始条数 offset', placeholder: '从第几条开始，如 1', type: 'number', required: true },
    { key: 'p2', label: '查询条数', placeholder: '共查多少条，如 10', type: 'number', required: true },
    { key: 'p3', label: '内容关键字', placeholder: '限制查询的短信内容关键字，省略查全部' },
  ],
  querytel: [
    { key: 'p1', label: '起始条数 offset', placeholder: '从第几条开始，如 1', type: 'number', required: true },
    { key: 'p2', label: '查询条数', placeholder: '共查多少条，如 10', type: 'number', required: true },
    { key: 'p3', label: '通话类型', placeholder: '0 全部 1 来电 2 外呼 3 漏接', type: 'number' },
    { key: 'p4', label: '号码关键字', placeholder: '限制查询的号码关键字，省略查全部' },
  ],
  telkeypress: [
    { key: 'p1', label: '卡槽号', placeholder: '1 或 2', type: 'number', required: true },
    { key: 'p2', label: '按键序列', placeholder: '0-9,A-D,*,#；暂停 p/P/m/M', required: true, hint: 'p=1秒 P=5秒 m=0.1秒 M=0.5秒' },
    { key: 'p3', label: '按键音时长（毫秒）', placeholder: '默认 200', type: 'number' },
    { key: 'p4', label: '按键间隔（毫秒）', placeholder: '默认 100', type: 'number' },
    { key: 'tid', label: 'tid（可选）', placeholder: '' },
  ],
  teldial: [
    { key: 'p1', label: '卡槽号', placeholder: '1 或 2', type: 'number', required: true },
    { key: 'p2', label: '电话号码', placeholder: '如 13206411822', required: true },
    { key: 'p3', label: '通话总时长（秒）', placeholder: '默认 175', type: 'number' },
    { key: 'p4', label: '拨通后 TTS 内容', placeholder: '可选' },
    { key: 'p5', label: 'TTS 播放轮数', placeholder: '如 2', type: 'number' },
    { key: 'p6', label: '每轮间隔（秒）', placeholder: '如 1', type: 'number' },
    { key: 'p7', label: '播放完后动作', placeholder: '0 无操作，1 挂断', type: 'number' },
    { key: 'tid', label: 'tid（可选）', placeholder: '' },
  ],
  telanswer: [
    { key: 'p1', label: '卡槽号', placeholder: '1 或 2', type: 'number', required: true },
    { key: 'p2', label: '通话总时长（秒）', placeholder: '默认 175', type: 'number' },
    { key: 'p3', label: '接通后 TTS 内容', placeholder: '可选' },
    { key: 'p4', label: 'TTS 播放轮数', placeholder: '如 2', type: 'number' },
    { key: 'p5', label: '每轮间隔（秒）', placeholder: '如 1', type: 'number' },
    { key: 'p6', label: '播放完后动作', placeholder: '0 无操作，1 挂断', type: 'number' },
    { key: 'tid', label: 'tid（可选）', placeholder: '' },
  ],
  telhangup: [
    { key: 'p1', label: '卡槽号', placeholder: '1 或 2', type: 'number', required: true },
    { key: 'tid', label: 'tid（可选）', placeholder: '' },
  ],
  teltts: [
    { key: 'p1', label: '卡槽号', placeholder: '1 或 2', type: 'number', required: true },
    { key: 'p2', label: 'TTS 语音内容', placeholder: '播放内容', required: true },
    { key: 'p3', label: 'TTS 播放次数', placeholder: '0 表示不限', type: 'number' },
    { key: 'p4', label: '每轮间隔（秒）', placeholder: '如 1', type: 'number' },
    { key: 'p5', label: '播放完后动作', placeholder: '0 无操作，1 挂断', type: 'number' },
    { key: 'tid', label: 'tid（可选）', placeholder: '' },
  ],
  stoptts: [
    { key: 'p1', label: '卡槽号', placeholder: '1 或 2', type: 'number', required: true },
    { key: 'p2', label: '停止后动作', placeholder: '0 无操作，1 挂断', type: 'number' },
    { key: 'tid', label: 'tid（可选）', placeholder: '' },
  ],
  wf: [{ key: 'p1', label: 'WIFI 状态', placeholder: 'on 或 off', required: true, hint: 'on 开启，off 关闭' }],
  addwf: [
    { key: 'p1', label: 'WIFI 热点名', placeholder: 'SSID', required: true },
    { key: 'p2', label: 'WIFI 密码', placeholder: '热点密码', required: true },
  ],
  delwf: [{ key: 'p1', label: 'WIFI 热点名', placeholder: '要删除的 SSID', required: true }],
  now: [
    { key: 'p1', label: '当前时间', placeholder: 'YYYYMMDDhhmmss，省略则自动获取' },
    { key: 'p2', label: '自动校时', placeholder: '0 不允许，15 允许（默认）', type: 'number' },
    { key: 'p3', label: '时区', placeholder: '8 中国（默认）', type: 'number' },
  ],
  dailyrst: [{ key: 'p1', label: '每日重启小时', placeholder: '0~23；大于 23 表示关闭', type: 'number', required: true }],
  pingsec: [{ key: 'p1', label: 'PING 间隔（秒）', placeholder: '最小值 10', type: 'number', required: true }],
  chpwduser: [{ key: 'p1', label: '新用户密码', placeholder: '不少于 4 位', required: true }],
  slotrst: [{ key: 'p1', label: '卡槽号', placeholder: '1 或 2', type: 'number', required: true }],
  slotoff: [{ key: 'p1', label: '卡槽号', placeholder: '1 或 2', type: 'number', required: true }],
  simcfu: [
    { key: 'p1', label: '卡槽号', placeholder: '1 或 2', type: 'number', required: true },
    { key: 'p2', label: '呼转目标号码', placeholder: '留空表示取消呼转' },
  ],
  asksimcfu: [{ key: 'p1', label: '卡槽号', placeholder: '1 或 2', type: 'number', required: true }],
  dailyota: [{ key: 'p1', label: '每日 OTA 小时', placeholder: '0~23；大于 23 表示关闭', type: 'number', required: true }],
};

const form = reactive<{
  cmd: string;
  cmdOther: string;
  params: Record<string, string>;
  extraParams: string;
}>({
  cmd: '',
  cmdOther: '',
  params: {},
  extraParams: '',
});

const currentParams = computed(() => {
  const cmd = form.cmd === 'other' ? '' : form.cmd;
  if (!cmd) return [];
  return CMD_PARAMS[cmd] ?? [];
});

const sending = ref(false);
const result = ref<{ data: unknown; ok: boolean } | null>(null);

const resultOk = computed(() => result.value?.ok ?? false);
const resultText = computed(() => {
  if (result.value == null) return '';
  return typeof result.value.data === 'object'
    ? JSON.stringify(result.value.data, null, 2)
    : String(result.value.data);
});

function filterOption(input: string, option: { value?: string; label?: string }) {
  const label = option?.label ?? option?.value ?? '';
  return String(label).toLowerCase().includes(input.toLowerCase());
}

function parseExtraParams(): Record<string, string> {
  const out: Record<string, string> = {};
  const lines = form.extraParams.trim().split('\n');
  for (const line of lines) {
    const idx = line.indexOf('=');
    if (idx > 0) {
      const k = line.slice(0, idx).trim();
      const v = line.slice(idx + 1).trim();
      if (k) out[k] = v;
    }
  }
  return out;
}

function buildPayload(): Record<string, unknown> {
  const cmd = form.cmd === 'other' ? form.cmdOther.trim() : form.cmd.trim();
  const payload: Record<string, unknown> = { cmd };

  if (form.cmd === 'other') {
    Object.assign(payload, parseExtraParams());
    return payload;
  }

  const paramKeys = new Set((CMD_PARAMS[cmd] ?? []).map((p) => p.key));
  for (const key of paramKeys) {
    const value = form.params[key];
    const v = typeof value === 'string' ? value.trim() : value;
    if (v !== '' && v !== undefined) payload[key] = v;
  }
  return payload;
}

async function send() {
  const cmd = form.cmd === 'other' ? form.cmdOther.trim() : form.cmd.trim();
  if (!cmd) {
    result.value = { data: '请选择或填写指令', ok: false };
    return;
  }
  sending.value = true;
  result.value = null;
  try {
    const payload = buildPayload() as ControlPayload;
    const res = await sendControl(payload);
    const ok = res.data.code === 0;
    result.value = { data: res.data.data ?? res.data, ok };
  } catch (e: unknown) {
    const err = e as { response?: { data?: unknown }; message?: string };
    result.value = {
      data: err.response?.data ?? err.message ?? '请求失败',
      ok: false,
    };
  } finally {
    sending.value = false;
  }
}
</script>

<style scoped>
.control-command {
  max-width: 640px;
}
.result-pre {
  margin: 0;
  font-size: 12px;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
