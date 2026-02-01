<template>
  <div class="control-command">
    <h1 class="title">控制指令</h1>
    <p class="intro">向开发板下发控制指令（代理到设备 /ctrl 接口）。格式见文档「控制指令」。</p>
    <div class="card">
      <div class="field">
        <label>设备地址 <span class="required">*</span></label>
        <input v-model="form.deviceUrl" type="text" placeholder="http://192.168.7.170:38585" />
      </div>
      <div class="field">
        <label>Token</label>
        <input v-model="form.token" type="text" placeholder="开发板 token（控制指令必填）" />
      </div>
      <div class="field">
        <label>指令 cmd <span class="required">*</span></label>
        <select v-model="form.cmd">
          <option value="">请选择</option>
          <option value="stat">stat - 获取开发板状态</option>
          <option value="restart">restart - 重启开发板</option>
          <option value="sendsms">sendsms - 外发短信</option>
          <option value="teldial">teldial - 电话拨号</option>
          <option value="telanswer">telanswer - 接听来电</option>
          <option value="telhangup">telhangup - 电话挂机</option>
          <option value="wf">wf - 打开/关闭 WIFI</option>
          <option value="addwf">addwf - 增加 WIFI 热点</option>
          <option value="delwf">delwf - 删除 WIFI 热点</option>
          <option value="now">now - 设置开发板时间</option>
          <option value="dailyrst">dailyrst - 设置每日重启时间</option>
          <option value="pingsec">pingsec - 修改 PING 间隔</option>
          <option value="slotrst">slotrst - 指定卡槽重启</option>
          <option value="slotoff">slotoff - 指定卡槽关机</option>
          <option value="other">其它（手动填写下方附加参数）</option>
        </select>
        <input v-if="form.cmd === 'other'" v-model="form.cmdOther" type="text" placeholder="cmd 值" class="cmd-other" />
      </div>
      <div class="field">
        <label>附加参数（可选）</label>
        <textarea v-model="form.extraParams" placeholder="每行一个：参数名=值&#10;例：slot=1&#10;phNum=10086" rows="4"></textarea>
      </div>
      <button type="button" class="btn primary" :disabled="sending" @click="send">发送指令</button>
      <div v-if="result !== null" class="result" :class="resultOk ? 'ok' : 'err'">
        <div class="result-head">响应</div>
        <pre>{{ resultText }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { sendControl } from '@/api/lvyatech';

const form = reactive({
  deviceUrl: '',
  token: '',
  cmd: '',
  cmdOther: '',
  extraParams: '',
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

async function send() {
  const deviceUrl = form.deviceUrl.trim();
  const cmd = form.cmd === 'other' ? form.cmdOther.trim() : form.cmd.trim();
  if (!deviceUrl || !cmd) {
    result.value = { data: '请填写设备地址和指令', ok: false };
    return;
  }
  sending.value = true;
  result.value = null;
  try {
    const payload: Record<string, unknown> = {
      deviceUrl,
      cmd,
      ...(form.token.trim() ? { token: form.token.trim() } : {}),
      ...parseExtraParams(),
    };
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
.title {
  font-size: 24px;
  color: #1a1d24;
  margin-bottom: 8px;
}
.intro {
  color: #6b7280;
  font-size: 14px;
  margin-bottom: 20px;
}
.card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}
.field {
  margin-bottom: 20px;
}
.field label {
  display: block;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
  font-size: 14px;
}
.required {
  color: #dc2626;
}
.field input,
.field select,
.field textarea {
  width: 100%;
  max-width: 400px;
  padding: 10px 14px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
}
.field textarea {
  max-width: 100%;
  resize: vertical;
}
.field .cmd-other {
  margin-top: 8px;
}
.btn {
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  border: 1px solid #d1d5db;
  background: #fff;
}
.btn.primary {
  background: #3b82f6;
  color: #fff;
  border-color: #3b82f6;
}
.btn.primary:hover:not(:disabled) {
  background: #2563eb;
}
.btn.primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.result {
  margin-top: 24px;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}
.result-head {
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 14px;
}
.result.ok .result-head {
  color: #059669;
}
.result.err .result-head {
  color: #dc2626;
}
.result pre {
  margin: 0;
  font-size: 12px;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
