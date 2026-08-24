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
  { id: 'palette', name: '手账纸张调色台', shortName: '纸张调色', description: '为博客页面试配纸张、圆角和阴影。', path: '/lab#palette-title', category: 'experiment', icon: '◐', processing: 'local', status: 'stable', keywords: ['主题', '配色'] },
  { id: 'markdown', name: 'Markdown 排版台', shortName: 'Markdown', description: '在本地预览标题、引用、代码和标签。', path: '/lab#markdown-title', category: 'experiment', icon: 'M', processing: 'local', status: 'stable', keywords: ['Markdown', '排版'] },
  { id: 'garden', name: '文章关系地图', shortName: '文章地图', description: '从分类和标签里发现文章之间的路径。', path: '/lab#map-title', category: 'experiment', icon: '⌁', processing: 'local', status: 'stable', keywords: ['文章', '分类', '标签'] },
]

export const v1LabTools = labTools.filter((tool) => ['image', 'cover', 'color'].includes(tool.id))
