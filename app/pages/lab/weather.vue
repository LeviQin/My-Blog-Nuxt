<template>
  <LabToolPage :meta="meta">
    <section class="lab-workspace query-workspace" aria-labelledby="weather-workspace-title">
      <div class="lab-panel query-controls-panel">
        <div class="lab-panel-heading"><div><p class="card-kicker">01 · CITY</p><h2 id="weather-workspace-title">给一座城市写一页天气</h2></div><span class="lab-step">联网</span></div>
        <form class="lab-query-form" @submit.prevent="searchCity">
          <label for="weather-city">城市或区县</label>
          <div class="lab-query-input-row"><input id="weather-city" v-model="cityName" class="lab-input" maxlength="80" placeholder="例如：杭州、深圳南山"><button class="lab-button is-primary" type="submit" :disabled="state === 'loading'">{{ state === 'loading' ? '查询中…' : '查询天气' }}</button></div>
        </form>
        <p v-if="errorMessage" class="lab-message is-error" role="alert">{{ errorMessage }}</p>
        <div v-if="candidates.length > 1" class="lab-setting-group"><div class="lab-setting-heading"><strong>找到多个地点</strong><small>请选择更准确的一项</small></div><div class="query-candidate-list"><button v-for="candidate in candidates" :key="candidate.citycode || candidate.formatted_address" class="query-candidate" type="button" @click="selectCandidate(candidate)"><strong>{{ candidate.formatted_address || candidate.city || candidate.district }}</strong><small>{{ candidate.province || '' }} {{ candidate.city || '' }} {{ candidate.district || '' }}</small></button></div></div>
        <div v-if="weather" class="lab-setting-group"><div class="lab-setting-heading"><strong>结果操作</strong><small>只保留当前页面</small></div><div class="lab-button-row"><button class="lab-button is-secondary" type="button" @click="copySummary">{{ copied ? '已复制摘要' : '复制天气摘要' }}</button><button class="lab-button is-secondary" type="button" @click="downloadCard">下载天气卡</button></div></div>
        <p class="lab-privacy-line">城市名称会发送到博客后端查询，页面不请求定位权限，也不保存查询历史。</p>
      </div>
      <div class="lab-panel query-result-panel" aria-live="polite">
        <div class="lab-panel-heading"><div><p class="card-kicker">02 · WEATHER NOTE</p><h2>今天的天气手账</h2></div><span v-if="weather" class="lab-status is-success">已更新</span></div>
        <div v-if="!weather" class="lab-empty-result"><span class="lab-empty-result-icon is-weather" role="img" aria-label="天气图标"></span><h3>先写下一座城市</h3><p>天气结果会整理成一张温暖的卡片，并显示数据来源和更新时间。</p></div>
        <article v-else class="weather-card" :class="`is-${weatherTone}`">
          <div class="weather-scene" :class="`is-${weatherTone}`" aria-hidden="true"></div>
          <div class="weather-card-top"><div><span class="weather-card-label">{{ weather.province || 'LEVI LAB' }}</span><h3>{{ weather.city }}</h3><p>{{ weather.reporttime || '刚刚更新' }}</p></div><span class="weather-symbol" role="img" :aria-label="`${weather.weather || '天气'}图标`"><img :src="weatherIcon" alt="" /></span></div>
          <div class="weather-main"><strong>{{ weather.temperature || '—' }}<sup>℃</sup></strong><span>{{ weather.weather || '暂无天气描述' }}</span></div>
          <div class="weather-detail-grid"><div><small>湿度</small><strong>{{ weather.humidity ? `${weather.humidity}%` : '—' }}</strong></div><div><small>风向</small><strong>{{ weather.winddirection || '—' }}</strong></div><div><small>风力</small><strong>{{ weather.windpower ? `${weather.windpower} 级` : '—' }}</strong></div><div><small>来源</small><strong>高德天气</strong></div></div>
          <p class="weather-quote">{{ weatherQuote }}</p><small class="weather-source">数据来源：高德开放平台 · 更新时间：{{ weather.reporttime || '接口返回时间未知' }}</small>
        </article>
      </div>
    </section>
  </LabToolPage>
</template>

<script setup lang="ts">
import { labTools } from '~/data/lab-tools'
const meta = labTools.find((tool) => tool.id === 'weather')!
interface Candidate { adcode?: string; citycode?: string; province?: string; city?: string; district?: string; formatted_address?: string }
interface Weather { city: string; province: string; weather: string; temperature: string; humidity: string; winddirection: string; windpower: string; reporttime: string }
const api = useBlogApi()
const cityName = ref('')
const candidates = ref<Candidate[]>([])
const weather = ref<Weather | null>(null)
const state = ref<'idle' | 'loading'>('idle')
const errorMessage = ref('')
const copied = ref(false)
const weatherTone = computed(() => { const value = weather.value?.weather || ''; if (value.includes('雨')) return 'rain'; if (value.includes('雪')) return 'snow'; if (value.includes('云') || value.includes('阴') || value.includes('雾') || value.includes('霾') || value.includes('沙尘')) return 'cloud'; return 'sun' })
const weatherIcon = computed(() => ({ sun: '/images/ui/lab/weather-sun.svg', rain: '/images/ui/lab/weather-rain.svg', snow: '/images/ui/lab/weather-snow.svg', cloud: '/images/ui/lab/weather-cloud.svg' }[weatherTone.value] || '/images/ui/lab/weather-sun.svg'))
const weatherQuote = computed(() => { const value = weather.value?.weather || ''; if (value.includes('雨')) return '适合在窗边整理一篇旧文章。'; if (value.includes('雪')) return '给今天留一张更安静的纸。'; if (value.includes('低温')) return '给杯子续上热水，再继续写代码。'; return '带上相机，去收集一点今天的光。' })
const summary = computed(() => weather.value ? `${weather.value.city}：${weather.value.weather}，${weather.value.temperature}℃，湿度${weather.value.humidity || '未知'}%，${weather.value.winddirection || ''}${weather.value.windpower || ''}级。数据时间：${weather.value.reporttime || '未知'}。` : '')
function normalizeWeather(data: any, candidate: Candidate): Weather | null { const live = Array.isArray(data?.lives) ? data.lives.find((item: any) => item && !Array.isArray(item) && typeof item === 'object') : data?.live || data?.lives?.[0]; if (!live) return null; return { city: live.city || candidate.city || candidate.district || cityName.value.trim(), province: live.province || candidate.province || '', weather: String(live.weather || ''), temperature: String(live.temperature || ''), humidity: String(live.humidity || ''), winddirection: String(live.winddirection || ''), windpower: String(live.windpower || ''), reporttime: String(live.reporttime || '') } }
async function loadWeather(candidate: Candidate) { const code = candidate.adcode || candidate.citycode; if (!code) { errorMessage.value = '没有找到可查询的城市编码，请换一个更具体的名称。'; return }; state.value = 'loading'; errorMessage.value = ''; try { const data = await api.weatherInfo(code); weather.value = normalizeWeather(data, candidate); if (!weather.value) errorMessage.value = '天气服务暂时没有返回有效结果，请稍后重试。' } catch { errorMessage.value = '天气服务暂时没有回应，请稍后重试。' } finally { state.value = 'idle' } }
async function searchCity() { const value = cityName.value.trim(); if (!value) { errorMessage.value = '请先输入城市或区县名称。'; return }; state.value = 'loading'; errorMessage.value = ''; weather.value = null; candidates.value = []; try { const data = await api.cityCode(value); const list = Array.isArray(data?.geocodes) ? data.geocodes : []; candidates.value = list; if (!list.length) errorMessage.value = '没有找到这个地点，请换一个城市或区县名称。'; else if (list.length === 1) await loadWeather(list[0]) } catch { errorMessage.value = '城市查询暂时没有回应，请稍后重试。'; state.value = 'idle' } finally { if (candidates.value.length !== 1) state.value = 'idle' } }
async function selectCandidate(candidate: Candidate) { await loadWeather(candidate) }
async function copySummary() { if (!summary.value) return; try { await navigator.clipboard.writeText(summary.value); copied.value = true; window.setTimeout(() => copied.value = false, 1500) } catch { errorMessage.value = '无法复制，请手动选择天气摘要。' } }
function downloadCard() { if (!weather.value) return; const canvas = document.createElement('canvas'); canvas.width = 1200; canvas.height = 700; const context = canvas.getContext('2d'); if (!context) return; context.fillStyle = '#f3ead6'; context.fillRect(0, 0, canvas.width, canvas.height); context.fillStyle = '#3f4839'; context.font = '34px sans-serif'; context.fillText('LEVI LAB · WEATHER NOTE', 72, 84); context.font = '72px sans-serif'; context.fillText(weather.value.city, 72, 190); context.font = '42px sans-serif'; context.fillText(`${weather.value.weather}  ${weather.value.temperature}℃`, 72, 280); context.font = '25px sans-serif'; context.fillText(`湿度 ${weather.value.humidity || '—'}% · ${weather.value.winddirection || '—'} ${weather.value.windpower || '—'}级`, 72, 350); context.fillStyle = '#69733e'; context.font = '30px sans-serif'; context.fillText(weatherQuote.value, 72, 500); context.fillStyle = '#7c7666'; context.font = '18px sans-serif'; context.fillText(`数据来源：高德开放平台 · ${weather.value.reporttime || ''}`, 72, 620); canvas.toBlob((blob) => { if (!blob) return; const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `${weather.value?.city || 'weather'}-weather-note.png`; link.click(); URL.revokeObjectURL(url) }, 'image/png') }
useBlogSeo({ title: '城市天气手账', description: '查询城市天气并生成一张可下载的手账卡，显示温度、湿度、风向、来源和更新时间。', canonical: '/lab/weather', keywords: '天气查询,城市天气,天气手账', breadcrumbs: [{ name: '手账实验室', path: '/lab' }, { name: '城市天气手账', path: '/lab/weather' }] })
</script>
