export type LabToolCategory = 'image' | 'creator' | 'query' | 'developer' | 'experiment'
export type LabProcessing = 'local' | 'online' | 'experimental'

export interface LabToolMeta {
  id: string
  name: string
  shortName: string
  description: string
  path: string
  category: LabToolCategory
  icon: string
  processing: LabProcessing
  status: 'stable' | 'beta' | 'planned'
  featured?: boolean
  keywords: string[]
}

export const labTools: LabToolMeta[] = [
  { id: 'image', name: '图片轻处理台', shortName: '图片轻处理', description: '压缩、缩放并转换 JPG、PNG 和 WebP，原图留在浏览器里。', path: '/lab/image', category: 'image', icon: '▧', processing: 'local', status: 'stable', featured: true, keywords: ['压缩', '缩放', '格式转换'] },
  { id: 'cover', name: '手账封面生成器', shortName: '手账封面', description: '用 Levi Blog 的纸张主题生成文章封面和分享卡。', path: '/lab/cover', category: 'creator', icon: '✦', processing: 'local', status: 'stable', featured: true, keywords: ['封面', '分享卡', 'Canvas'] },
  { id: 'color', name: '图片取色与主题', shortName: '图片取色', description: '从照片提取稳定色板，复制 CSS、JSON 和对比度结果。', path: '/lab/color', category: 'image', icon: '◌', processing: 'local', status: 'stable', featured: true, keywords: ['色板', 'HEX', 'CSS 变量'] },
  { id: 'weather', name: '城市天气手账', shortName: '天气手账', description: '查询城市天气，并整理成一张可以下载的本地手账卡。', path: '/lab/weather', category: 'query', icon: '/images/ui/lab/icon-weather.png', processing: 'online', status: 'stable', featured: true, keywords: ['天气', '城市', '手账卡'] },
  { id: 'ip', name: 'IP 信息查询', shortName: 'IP 查询', description: '查询 IPv4 的粗略归属信息，明确区分指定 IP 与当前访问 IP。', path: '/lab/ip', category: 'query', icon: '/images/ui/lab/icon-ip.png', processing: 'online', status: 'stable', keywords: ['IPv4', '归属', '隐私'] },
  { id: 'qr', name: '二维码工作台', shortName: '二维码', description: '把文本、网址、Wi-Fi、邮箱或电话编码成可下载二维码。', path: '/lab/qr', category: 'creator', icon: '/images/ui/lab/icon-qr.png', processing: 'local', status: 'stable', keywords: ['二维码', 'PNG', 'SVG'] },
  { id: 'dev', name: '开发者便签', shortName: '开发便签', description: '在一页手账里处理 JSON、时间戳、URL、Base64 和文本统计。', path: '/lab/dev', category: 'developer', icon: '/images/ui/lab/icon-dev.png', processing: 'local', status: 'stable', keywords: ['JSON', '时间戳', 'Base64'] },
  { id: 'palette', name: '手账纸张调色台', shortName: '纸张调色', description: '为博客页面试配纸张、圆角和阴影。', path: '/lab#palette-title', category: 'experiment', icon: '◐', processing: 'local', status: 'stable', keywords: ['主题', '配色'] },
  { id: 'markdown', name: 'Markdown 排版台', shortName: 'Markdown', description: '在本地预览标题、引用、代码和标签。', path: '/lab#markdown-title', category: 'experiment', icon: 'M', processing: 'local', status: 'stable', keywords: ['Markdown', '排版'] },
  { id: 'garden', name: '文章关系地图', shortName: '文章地图', description: '从分类和标签里发现文章之间的路径。', path: '/lab#map-title', category: 'experiment', icon: '⌁', processing: 'local', status: 'stable', keywords: ['文章', '分类', '标签'] },
]

export const v1LabTools = labTools.filter((tool) => ['image', 'cover', 'color', 'weather', 'ip', 'qr', 'dev'].includes(tool.id))
