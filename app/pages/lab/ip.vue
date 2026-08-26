<template>
  <LabToolPage :meta="meta">
    <section class="lab-workspace query-workspace" aria-labelledby="ip-workspace-title">
      <div class="lab-panel query-controls-panel">
        <div class="lab-panel-heading">
          <div>
            <p class="card-kicker">01 · LOOKUP</p>
            <h2 id="ip-workspace-title">看看一个 IP 的大致位置</h2>
          </div>
          <span class="lab-step">联网</span>
        </div>
        <label for="ip-value">指定 IPv4</label>
        <div class="lab-query-input-row">
          <input
            id="ip-value"
            v-model="ipValue"
            class="lab-input"
            maxlength="64"
            placeholder="例如：8.8.8.8"
          /><button
            class="lab-button is-primary"
            type="button"
            :disabled="state === 'loading'"
            @click="lookup(false)"
          >
            {{ state === "loading" ? "查询中…" : "查询指定 IP" }}
          </button>
        </div>
        <button
          class="lab-button is-secondary lab-full-button"
          type="button"
          :disabled="state === 'loading'"
          @click="lookup(true)"
        >
          查询我的 IP
        </button>
        <p v-if="errorMessage" class="lab-message is-error" role="alert">
          {{ errorMessage }}
        </p>
        <p class="lab-privacy-line">
          “我的 IP”只在你主动点击后查询。IP 归属是粗略位置，不等同于
          GPS；页面不保存查询历史。
        </p>
      </div>
      <div class="lab-panel query-result-panel" aria-live="polite">
        <div class="lab-panel-heading">
          <div>
            <p class="card-kicker">02 · IP NOTE</p>
            <h2>IP 信息手账</h2>
          </div>
          <span v-if="result" class="lab-status is-success">已查询</span>
        </div>
        <div v-if="!result" class="lab-empty-result">
          <span
            class="lab-empty-result-icon is-ip"
            role="img"
            aria-label="IP 查询图标"
          ></span>
          <h3>输入一个 IPv4</h3>
          <p>你可以查询指定 IP，也可以在明确主动操作后查询当前访问 IP。</p>
        </div>
        <article v-else class="ip-result-card">
          <div class="ip-result-heading">
            <span class="ip-pin" role="img" aria-label="IP 定位图标"
              ><img src="/images/ui/lab/ip-pin.png" alt=""
            /></span>
            <div>
              <small>{{ result.isMine ? "当前访问 IP" : "指定 IP" }}</small>
              <h3>{{ result.ip }}</h3>
            </div>
            <button class="lab-text-button" type="button" @click="copyIp">
              {{ copied ? "已复制" : "复制 IP" }}
            </button>
          </div>
          <div v-if="result.private" class="query-notice is-warning">
            <strong>这是私有或保留地址</strong><span>{{ result.message }}</span>
          </div>
          <div v-else class="ip-detail-grid">
            <div>
              <small>国家</small><strong>{{ result.country || "未知" }}</strong>
            </div>
            <div>
              <small>省份</small><strong>{{ result.province || "未知" }}</strong>
            </div>
            <div>
              <small>城市</small><strong>{{ result.city || "未知" }}</strong>
            </div>
            <div>
              <small>运营商</small><strong>{{ result.isp || "数据源未提供" }}</strong>
            </div>
            <div>
              <small>数据源</small><strong>{{ result.source || "IP 离线库" }}</strong>
            </div>
          </div>
          <p class="ip-result-note">
            IP 定位只能提供网络出口的粗略归属，不能用于判断精确地址或个人身份。
          </p>
        </article>
      </div>
    </section>
  </LabToolPage>
</template>

<script setup lang="ts">
import { labTools } from "~/data/lab-tools";
const meta = labTools.find((tool) => tool.id === "ip")!;
const api = useBlogApi();
const ipValue = ref("");
const state = ref<"idle" | "loading">("idle");
const errorMessage = ref("");
const copied = ref(false);
interface IpResult {
  ip: string;
  country?: string;
  province?: string;
  city?: string;
  isp?: string;
  source?: string;
  private?: boolean;
  message?: string;
  isMine?: boolean;
}
const result = ref<IpResult | null>(null);
function isValidIp(value: string) {
  const parts = value.split(".");
  return (
    parts.length === 4 &&
    parts.every((part) => /^\d{1,3}$/.test(part) && Number(part) <= 255)
  );
}
function isPublicIpv4(value: string) {
  if (!isValidIp(value)) return false;
  const [first, second] = value.split(".").map(Number);
  if (first === 0 || first === 10 || first === 127 || first >= 224) return false;
  if (first === 192 && second === 168) return false;
  if (first === 172 && second >= 16 && second <= 31) return false;
  return !(first === 169 && second === 254);
}
function resolveWebRtcPublicIpv4() {
  return new Promise<string>((resolve) => {
    if (typeof RTCPeerConnection === "undefined") {
      resolve("");
      return;
    }
    const connection = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
    let settled = false;
    const timer = window.setTimeout(() => finish(""), 3500);
    const finish = (value: string) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      connection.close();
      resolve(value);
    };
    connection.onicecandidate = (event) => {
      const candidate = event.candidate?.candidate || "";
      const match = candidate.match(/\s((?:\d{1,3}\.){3}\d{1,3})\s+\d+\s+typ\s+srflx\b/);
      if (match && isPublicIpv4(match[1])) finish(match[1]);
      else if (!event.candidate) finish("");
    };
    connection.createDataChannel("ip");
    connection.createOffer()
      .then((offer) => connection.setLocalDescription(offer))
      .catch(() => finish(""));
  });
}
function normalize(data: any, ip: string, isMine: boolean): IpResult {
  return {
    ip: String(data?.ip || ip),
    country: String(data?.country || ""),
    province: String(data?.province || data?.pro || ""),
    city: String(data?.city || ""),
    isp: String(data?.isp || data?.adcode || ""),
    source: String(data?.source || "IP 离线库"),
    private: Boolean(data?.private),
    message: String(data?.message || ""),
    isMine,
  };
}
async function lookup(isMine: boolean) {
  let value = ipValue.value.trim();
  if (!isMine && !isValidIp(value)) {
    errorMessage.value = "请输入合法 IPv4，不要包含协议、端口或路径。";
    return;
  }
  state.value = "loading";
  errorMessage.value = "";
  result.value = null;
  try {
    if (isMine) {
      const [webRtcResult, ipifyResult] = await Promise.allSettled([
        resolveWebRtcPublicIpv4(),
        $fetch<{ ip?: string }>("https://api.ipify.org?format=json", { timeout: 5000 }),
      ]);
      const webRtcIp = webRtcResult.status === "fulfilled" ? webRtcResult.value : "";
      const ipifyIp = ipifyResult.status === "fulfilled"
        ? String(ipifyResult.value?.ip || "").trim()
        : "";
      // WebRTC 更可能反映 VPN 的公网出口；ipify 作为被代理或浏览器策略拦截时的回退。
      value = webRtcIp || (isValidIp(ipifyIp) ? ipifyIp : "");
      if (!value) {
        const fallback = await api.identifyIpArea();
        value = String(fallback?.ip || "").trim();
        result.value = normalize(fallback, value, true);
        if (fallback?.private) errorMessage.value = "当前开发环境只能识别到本机回环地址，无法从浏览器推断公网 IP。";
        return;
      }
    }
    const data = await api.identifyIpArea(value);
    result.value = normalize(data, value, isMine);
  } catch {
    errorMessage.value = isMine
      ? "无法取得当前公网 IPv4，请检查网络后重试。"
      : "IP 查询暂时没有回应，请稍后重试。";
  } finally {
    state.value = "idle";
  }
}
async function copyIp() {
  if (!result.value) return;
  try {
    await navigator.clipboard.writeText(result.value.ip);
    copied.value = true;
    window.setTimeout(() => (copied.value = false), 1500);
  } catch {
    errorMessage.value = "无法复制，请手动选择 IP。";
  }
}
useBlogSeo({
  title: "IP 信息查询",
  description:
    "查询指定 IPv4 或主动查询当前访问 IP 的粗略归属信息，清楚说明隐私边界和定位限制。",
  canonical: "/lab/ip",
  keywords: "IP查询,IPv4归属,IP地址",
  breadcrumbs: [
    { name: "手账实验室", path: "/lab" },
    { name: "IP 信息查询", path: "/lab/ip" },
  ],
});
</script>
