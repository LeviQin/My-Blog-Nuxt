export function formatBytes(value: number) {
  if (!Number.isFinite(value) || value < 0) return '0 B'
  if (value < 1024) return `${value} B`
  const units = ['KB', 'MB', 'GB']
  let size = value / 1024
  let unit = units[0]
  for (let index = 0; index < units.length - 1 && size >= 1024; index += 1) {
    size /= 1024
    unit = units[index + 1]
  }
  return `${size >= 10 ? size.toFixed(0) : size.toFixed(1)} ${unit}`
}

export function cleanFileName(value: string, fallback = 'levi-lab') {
  const cleaned = String(value || '').replace(/\.[^.]+$/, '').replace(/[\\/:*?"<>|\u0000-\u001f]/g, '-').replace(/\s+/g, ' ').trim()
  return (cleaned || fallback).slice(0, 80)
}

export function containSize(sourceWidth: number, sourceHeight: number, mode: string, values: { width?: number; height?: number }) {
  if (mode === 'max-width' && values.width && sourceWidth > values.width) return { width: values.width, height: Math.max(1, Math.round(values.width * sourceHeight / sourceWidth)) }
  if (mode === 'max-height' && values.height && sourceHeight > values.height) return { width: Math.max(1, Math.round(values.height * sourceWidth / sourceHeight)), height: values.height }
  if (mode === 'exact' && values.width && values.height) {
    const ratio = Math.min(values.width / sourceWidth, values.height / sourceHeight)
    return { width: Math.max(1, Math.round(sourceWidth * ratio)), height: Math.max(1, Math.round(sourceHeight * ratio)) }
  }
  return { width: sourceWidth, height: sourceHeight }
}

export function hexToRgb(hex: string) {
  const normalized = String(hex || '').replace('#', '').trim()
  const full = normalized.length === 3 ? normalized.split('').map((part) => `${part}${part}`).join('') : normalized
  const value = Number.parseInt(full, 16)
  if (!Number.isFinite(value) || full.length !== 6) return { r: 0, g: 0, b: 0 }
  return { r: (value >> 16) & 255, g: (value >> 8) & 255, b: value & 255 }
}

export function rgbToHex(r: number, g: number, b: number) {
  return `#${[r, g, b].map((part) => Math.max(0, Math.min(255, Math.round(part))).toString(16).padStart(2, '0')).join('')}`.toUpperCase()
}

export function rgbToHsl(r: number, g: number, b: number) {
  const red = r / 255; const green = g / 255; const blue = b / 255
  const max = Math.max(red, green, blue); const min = Math.min(red, green, blue)
  let hue = 0; const lightness = (max + min) / 2; const delta = max - min
  let saturation = 0
  if (delta) {
    saturation = delta / (1 - Math.abs(2 * lightness - 1))
    if (max === red) hue = ((green - blue) / delta) % 6
    else if (max === green) hue = (blue - red) / delta + 2
    else hue = (red - green) / delta + 4
    hue = Math.round(hue * 60)
    if (hue < 0) hue += 360
  }
  return { h: hue, s: Math.round(saturation * 100), l: Math.round(lightness * 100) }
}

function luminanceChannel(value: number) {
  const channel = value / 255
  return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
}

export function contrastRatio(first: string, second: string) {
  const one = hexToRgb(first); const two = hexToRgb(second)
  const firstLuminance = 0.2126 * luminanceChannel(one.r) + 0.7152 * luminanceChannel(one.g) + 0.0722 * luminanceChannel(one.b)
  const secondLuminance = 0.2126 * luminanceChannel(two.r) + 0.7152 * luminanceChannel(two.g) + 0.0722 * luminanceChannel(two.b)
  return (Math.max(firstLuminance, secondLuminance) + 0.05) / (Math.min(firstLuminance, secondLuminance) + 0.05)
}

export function isSupportedImage(file: File) {
  return ['image/jpeg', 'image/png', 'image/webp'].includes(file.type.toLowerCase())
}

export function mimeExtension(mime: string) {
  return mime === 'image/png' ? 'png' : mime === 'image/webp' ? 'webp' : 'jpg'
}
